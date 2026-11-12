mod checks;
mod files;
mod preview;
mod project;
mod runtime;

use anyhow::{Context, Result, ensure};
use base64::{Engine, engine::general_purpose::STANDARD};
use rmcp::{
    RoleServer, ServerHandler, ServiceExt,
    handler::server::wrapper::Parameters,
    model::{CallToolResult, ContentBlock, ServerCapabilities, ServerConfig},
    schemars,
    service::RequestContext,
    tool, tool_handler, tool_router,
};
use runtime::Runtime;
use serde::Deserialize;
use serde_json::{Value, json};
use std::{path::PathBuf, sync::Arc};

#[derive(Clone)]
struct Server {
    runtime: Arc<Runtime>,
    processes: Arc<checks::Processes>,
    preview: Arc<tokio::sync::Mutex<Option<preview::Running>>>,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct OpenStudio {
    #[serde(default)]
    open_browser: bool,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(tag = "operation", rename_all = "kebab-case", deny_unknown_fields)]
#[schemars(extend("type" = "object"))]
enum Edit {
    State,
    Create {
        dosbox_conf: String,
        expected_revision: u64,
        #[serde(default)]
        discard_changes: bool,
    },
    Open {
        source: PathBuf,
        expected_revision: u64,
        #[serde(default)]
        discard_changes: bool,
    },
    Config {
        dosbox_conf: String,
        jsdos_version: String,
        expected_revision: u64,
    },
    Tree,
    Read {
        path: String,
    },
    Files {
        files: Vec<FileEdit>,
        expected_revision: u64,
    },
    Start {
        expected_revision: u64,
    },
    Restart {
        expected_revision: u64,
    },
    Export {
        destination: PathBuf,
        expected_revision: u64,
        #[serde(default)]
        replace: bool,
    },
    Recover {
        expected_revision: u64,
        #[serde(default)]
        discard_changes: bool,
    },
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct FileEdit {
    path: String,
    contents_base64: Option<String>,
    #[serde(default)]
    delete: bool,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct Diagnose {
    source: Option<PathBuf>,
    #[serde(default)]
    wait_ready_ms: u32,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(tag = "type", rename_all = "kebab-case", deny_unknown_fields)]
enum Step {
    Key { key_code: u32, pressed: bool },
    Mouse { x: f64, y: f64 },
    Button { button: u8, pressed: bool },
    Wait { ms: u32 },
    State,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct Scenario {
    steps: Vec<Step>,
    stdout: String,
    timeout_ms: u32,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct Generate {
    destination: PathBuf,
    preset: String,
    source: PathBuf,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(deny_unknown_fields)]
struct VerifyProject {
    project: PathBuf,
    #[serde(default)]
    allow_build_scripts: bool,
    timeout_seconds: u32,
}

#[derive(Deserialize, schemars::JsonSchema)]
#[serde(tag = "operation", rename_all = "kebab-case", deny_unknown_fields)]
#[schemars(extend("type" = "object"))]
enum PreviewProject {
    Start {
        directory: PathBuf,
        upstream: Option<String>,
    },
    Report,
    Stop,
}

impl Server {
    fn result(&self, result: Result<Value>) -> CallToolResult {
        match result {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(error) => CallToolResult::error(vec![ContentBlock::text(
                format!("{error:#}").replace(&self.runtime.secret, "[redacted]"),
            )]),
        }
    }
}

#[tool_router]
impl Server {
    fn new(runtime: Arc<Runtime>) -> Self {
        Self {
            runtime,
            processes: Arc::new(checks::Processes::default()),
            preview: Arc::new(tokio::sync::Mutex::new(None)),
        }
    }

    #[tool(
        description = "Return Studio connection status and a loopback URL; optionally open the system browser. Never treat an unconnected browser as ready."
    )]
    async fn studio(&self, Parameters(input): Parameters<OpenStudio>) -> CallToolResult {
        let mut status = self.runtime.status().await;
        status["url"] = json!(self.runtime.browser_url());
        if input.open_browser
            && let Err(error) = self.runtime.open_browser().await
        {
            status["openError"] = json!(
                error
                    .to_string()
                    .replace(&self.runtime.secret, "[redacted]")
            );
        }
        self.result(Ok(status))
    }

    #[tool(
        description = "Finite editor operations. Read state before mutations and supply its revision. Open/import requires explicit paths and discard permission. Export is a complete ZIP, not a changes save. Lost acknowledgements have unknown outcomes and are never replayed."
    )]
    async fn editor(&self, Parameters(input): Parameters<Edit>) -> CallToolResult {
        self.result(self.edit(input).await)
    }

    #[tool(
        description = "Validate an explicitly selected ZIP/folder or observe the connected emulator. Observations do not prove arbitrary game correctness; absent runtime is not-run."
    )]
    async fn diagnose(&self, Parameters(input): Parameters<Diagnose>) -> CallToolResult {
        self.result(
            async {
                ensure!(
                    input.wait_ready_ms <= 30000,
                    "Readiness wait must not exceed 30 seconds"
                );
                if let Some(path) = input.source {
                    ensure!(
                        input.wait_ready_ms == 0,
                        "source validation and runtime wait are separate checks"
                    );
                    let report = match files::read(&path).and_then(|bytes| files::validate(&bytes))
                    {
                        Ok(report) => report,
                        Err(error) => json!({"status":"invalid","errors":[format!("{error:#}")]}),
                    };
                    Ok(json!({"static":report,"runtime":{"status":"not-run"}}))
                } else if self.runtime.status().await["connection"] != "connected" {
                    Ok(json!({"status":"not-run","reason":"Studio is not connected"}))
                } else {
                    self.runtime
                        .call(
                            "diagnostics",
                            json!({"waitReadyMs":input.wait_ready_ms}),
                            false,
                        )
                        .await
                }
            }
            .await,
        )
    }

    #[tool(
        description = "Run at most 128 typed input/wait steps and wait at most 30 seconds for a required stdout substring. No JavaScript or shell. Coordinates are normalized. Held inputs are released on failure."
    )]
    async fn scenario(&self, Parameters(input): Parameters<Scenario>) -> CallToolResult {
        self.result(
            async {
                ensure!(
                    input.steps.len() <= 128 && input.timeout_ms > 0 && input.timeout_ms <= 30000,
                    "Scenario limit exceeded"
                );
                ensure!(
                    !input.stdout.is_empty() && input.stdout.len() <= 1024,
                    "A bounded stdout condition is required"
                );
                let mut steps = Vec::new();
                for step in input.steps {
                    steps.push(match step {
                        Step::Key { key_code, pressed } => {
                            ensure!((8..=123).contains(&key_code), "Invalid keycode");
                            json!({"type":"key","keyCode":key_code,"pressed":pressed})
                        }
                        Step::Mouse { x, y } => {
                            ensure!(
                                (0.0..=1.0).contains(&x) && (0.0..=1.0).contains(&y),
                                "Invalid coordinates"
                            );
                            json!({"type":"mouse","x":x,"y":y})
                        }
                        Step::Button { button, pressed } => {
                            ensure!(button <= 2, "Invalid mouse button");
                            json!({"type":"button","button":button,"pressed":pressed})
                        }
                        Step::Wait { ms } => {
                            ensure!(ms <= 10000, "Wait exceeds 10 seconds");
                            json!({"type":"wait","ms":ms})
                        }
                        Step::State => json!({"type":"state"}),
                    });
                }
                self.runtime
                    .call(
                        "scenario",
                        json!({"steps":steps,"stdout":input.stdout,"timeoutMs":input.timeout_ms}),
                        true,
                    )
                    .await
            }
            .await,
        )
    }

    #[tool(
        description = "Return a real emulator frame as a PNG image, or explicitly report no-frame before the first observed CI frame."
    )]
    async fn screenshot(&self) -> CallToolResult {
        match self.runtime.call("screenshot", json!({}), false).await {
            Ok(value) if value["status"] == "image" => {
                CallToolResult::success(vec![ContentBlock::image(
                    value["data"].as_str().unwrap_or_default(),
                    "image/png",
                )])
            }
            other => self.result(other),
        }
    }

    #[tool(
        description = "Create a new standalone html, vite, react, vue or angular project from an explicitly selected ZIP/folder. Never installs packages or runs project scripts. Destination must not already exist; generation needs no Node.js."
    )]
    async fn generate(&self, Parameters(input): Parameters<Generate>) -> CallToolResult {
        self.result((|| {
            let bytes = files::read(&input.source)?;
            project::generate(&input.destination, &input.preset, &bytes)
        })())
    }

    #[tool(
        description = "Check a selected generated project manifest. npm run build executes arbitrary local package scripts ONLY with explicit allow_build_scripts permission; never installs dependencies. Output is capped and the process tree is killed after at most 120 seconds. Missing browser verification remains not-run."
    )]
    async fn verify_project(
        &self,
        Parameters(input): Parameters<VerifyProject>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        self.result(tokio::select! {
            result = checks::verify(
                &input.project,
                input.allow_build_scripts,
                input.timeout_seconds,
                self.processes.clone(),
            ) => result,
            _ = context.ct.cancelled() => Err(anyhow::anyhow!("Build verification cancelled")),
        })
    }

    #[tool(
        description = "Opt-in diagnostic preview. Select an HTML/build directory or a project directory plus your already-running loopback Vite/Angular dev origin. Starts no scripts. Injects early browser diagnostics only in preview responses, never into project files or production builds. Report is not-run until a browser connects."
    )]
    async fn preview_project(
        &self,
        Parameters(input): Parameters<PreviewProject>,
    ) -> CallToolResult {
        self.result(
            async {
                let mut preview = self.preview.lock().await;
                match input {
                    PreviewProject::Start {
                        directory,
                        upstream,
                    } => {
                        ensure!(
                            preview.is_none(),
                            "Stop the active preview before opening another"
                        );
                        let running = preview::Preview::start(directory, upstream).await?;
                        let report = running.preview.report().await;
                        *preview = Some(running);
                        Ok(report)
                    }
                    PreviewProject::Report => Ok(preview
                        .as_ref()
                        .context("No active preview")?
                        .preview
                        .report()
                        .await),
                    PreviewProject::Stop => {
                        *preview = None;
                        Ok(json!({"status":"stopped"}))
                    }
                }
            }
            .await,
        )
    }
}

impl Server {
    async fn edit(&self, input: Edit) -> Result<Value> {
        match input {
            Edit::State => self.runtime.call("state", json!({}), false).await,
            Edit::Create { dosbox_conf, expected_revision, discard_changes } => {
                self.open(files::create(&dosbox_conf)?, expected_revision, discard_changes).await
            }
            Edit::Open { source, expected_revision, discard_changes } => {
                self.open(files::read(&source)?, expected_revision, discard_changes).await
            }
            Edit::Config { dosbox_conf, jsdos_version, expected_revision } => self.runtime.call("config",
                json!({"config":{"dosboxConf":dosbox_conf,"jsdosConf":{"version":jsdos_version}},"expectedRevision":expected_revision}), true).await,
            Edit::Tree => self.runtime.call("tree", json!({}), false).await,
            Edit::Read { path } => { files::relative(&path)?; self.runtime.call("read", json!({"path":path}), false).await }
            Edit::Files { files: edits, expected_revision } => {
                ensure!(!edits.is_empty() && edits.len() <= files::MAX_FILES, "Invalid batch size");
                let mut edits_json = Vec::new();
                let mut total = 0;
                for edit in edits {
                    files::relative(&edit.path)?;
                    ensure!(edit.delete != edit.contents_base64.is_some(), "Choose delete or contents_base64");
                    if let Some(contents) = &edit.contents_base64 { total += STANDARD.decode(contents)?.len(); }
                    ensure!(total <= files::MAX_ZIP, "Batch exceeds transfer quota");
                    edits_json.push(json!({"path":edit.path,"delete":edit.delete,"contents":edit.contents_base64}));
                }
                self.runtime.call("write", json!({"files":edits_json,"expectedRevision":expected_revision}), true).await
            }
            Edit::Start { expected_revision } => self.runtime.call("start", json!({"expectedRevision":expected_revision}), true).await,
            Edit::Restart { expected_revision } => self.runtime.call("restart", json!({"expectedRevision":expected_revision}), true).await,
            Edit::Export { destination, expected_revision, replace } => {
                let snapshot = self.runtime.call("snapshot", json!({"expectedRevision":expected_revision}), false).await?;
                let bytes = STANDARD.decode(snapshot["bundle"].as_str().context("Missing full snapshot")?)?;
                files::validate(&bytes)?;
                self.runtime.snapshots.lock().await.last = Some(bytes.clone());
                let destination = files::publish(&destination, &bytes, replace)?;
                Ok(json!({"path":destination,"revision":snapshot["revision"],"warnings":snapshot["warnings"]}))
            }
            Edit::Recover { expected_revision, discard_changes } => {
                let snapshots = self.runtime.snapshots.lock().await;
                let bytes = snapshots.last.as_ref().or(snapshots.original.as_ref()).context("No confirmed snapshot to recover")?.clone();
                drop(snapshots);
                let mut result = self.open(bytes, expected_revision, discard_changes).await?;
                result["warning"] = json!("Recovered only the last confirmed snapshot or original import, not unsaved browser memory");
                Ok(result)
            }
        }
    }
    async fn open(&self, bytes: Vec<u8>, expected: u64, discard: bool) -> Result<Value> {
        let report = files::validate(&bytes)?;
        let result = self.runtime.call("open", json!({"bundle":STANDARD.encode(&bytes),"expectedRevision":expected,"discardChanges":discard}), true).await?;
        *self.runtime.snapshots.lock().await = runtime::Snapshots {
            original: Some(bytes),
            last: None,
        };
        Ok(json!({"state":result,"validation":report}))
    }
}

#[tool_handler]
impl ServerHandler for Server {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_instructions("Open Studio, wait for connection, read editor state and use expected_revision on every mutation. Export explicitly to save a complete bundle. Closing a tab loses unsaved memory.")
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let (runtime, http) = Runtime::start().await?;
    let (reader, writer) = rmcp::transport::stdio();
    let transport = rmcp::transport::async_rw::AsyncRwTransport::new(reader, writer)
        .with_max_line_length(runtime::MAX_MESSAGE);
    let server = Server::new(runtime.clone());
    let processes = server.processes.clone();
    let preview = server.preview.clone();
    let service = server.serve(transport).await;
    if let Ok(service) = service {
        let _ = service.waiting().await;
    }
    http.abort();
    runtime.shutdown();
    *preview.lock().await = None;
    processes.shutdown();
    let _ = http.await;
    Ok(())
}
