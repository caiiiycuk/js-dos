use anyhow::{Result, ensure};
use axum::{
    Router,
    body::Body,
    extract::{
        State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    http::{HeaderMap, Request, StatusCode, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::get,
};
use serde_json::{Value, json};
use std::{
    collections::VecDeque,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tokio::{sync::Mutex, task::JoinHandle};

pub struct Preview {
    pub origin: String,
    secret: String,
    root: PathBuf,
    upstream: Option<String>,
    events: Mutex<VecDeque<Value>>,
    connected: AtomicBool,
    truncated: AtomicBool,
    shutdown: tokio::sync::watch::Sender<bool>,
}
pub struct Running {
    pub preview: Arc<Preview>,
    task: JoinHandle<()>,
}
impl Drop for Running {
    fn drop(&mut self) {
        self.preview.shutdown.send_replace(true);
        self.task.abort();
    }
}

impl Preview {
    pub async fn start(root: PathBuf, upstream: Option<String>) -> Result<Running> {
        let root = root.canonicalize()?;
        ensure!(root.is_dir(), "Preview requires a selected directory");
        if let Some(upstream) = &upstream {
            let url = reqwest::Url::parse(upstream)?;
            ensure!(
                url.scheme() == "http"
                    && url.host_str() == Some("127.0.0.1")
                    && url.port().is_some()
                    && url.username().is_empty()
                    && url.password().is_none()
                    && url.path() == "/"
                    && url.query().is_none()
                    && url.fragment().is_none(),
                "Upstream must be an explicitly selected http://127.0.0.1:PORT origin"
            );
        }
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await?;
        let preview = Arc::new(Self {
            origin: format!("http://{}", listener.local_addr()?),
            secret: uuid::Uuid::new_v4().to_string(),
            root,
            upstream,
            events: Mutex::new(VecDeque::new()),
            connected: AtomicBool::new(false),
            truncated: AtomicBool::new(false),
            shutdown: tokio::sync::watch::channel(false).0,
        });
        let app = Router::new()
            .route("/__jsdos_diagnostics.js", get(module))
            .route("/__jsdos_events", get(upgrade))
            .fallback(get(page))
            .layer(middleware::from_fn_with_state(preview.clone(), guard))
            .with_state(preview.clone());
        let task = tokio::spawn(async move {
            let _ = axum::serve(listener, app).await;
        });
        Ok(Running { preview, task })
    }
    pub async fn report(&self) -> Value {
        json!({"url":self.origin,"browser":{"status":if self.connected.load(Ordering::Relaxed) {"observed"} else {"not-run"},
            "events":self.events.lock().await.clone(),"truncated":self.truncated.load(Ordering::Relaxed)},
            "limit":"Observed browser events do not prove arbitrary game correctness. Production never includes the diagnostic module."})
    }
}

async fn guard(
    State(preview): State<Arc<Preview>>,
    request: Request<Body>,
    next: Next,
) -> Response {
    if request
        .headers()
        .get("sec-fetch-site")
        .is_some_and(|value| value != "same-origin" && value != "none")
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    if request
        .headers()
        .get(header::HOST)
        .and_then(|value| value.to_str().ok())
        != Some(preview.origin.trim_start_matches("http://"))
        || request
            .headers()
            .get(header::ORIGIN)
            .is_some_and(|value| value != preview.origin.as_str())
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    let mut response = next.run(request).await;
    for (name, value) in [
        ("cross-origin-opener-policy", "same-origin"),
        ("cross-origin-embedder-policy", "require-corp"),
        ("referrer-policy", "no-referrer"),
        ("cache-control", "no-store"),
        ("x-frame-options", "DENY"),
        ("cross-origin-resource-policy", "same-origin"),
        ("x-content-type-options", "nosniff"),
    ] {
        response.headers_mut().insert(name, value.parse().unwrap());
    }
    response
}
async fn module(State(preview): State<Arc<Preview>>) -> Response {
    (
        [(header::CONTENT_TYPE, "text/javascript")],
        include_str!("../studio/diagnostics.js").replace("__SESSION_SECRET__", &preview.secret),
    )
        .into_response()
}
async fn page(State(preview): State<Arc<Preview>>, request: Request<Body>) -> Response {
    match resource(
        &preview,
        request
            .uri()
            .path_and_query()
            .map_or("/", |path| path.as_str()),
    )
    .await
    {
        Ok((mime, mut bytes)) => {
            if mime.starts_with("text/html") {
                let html = String::from_utf8_lossy(&bytes);
                if !html.contains("/__jsdos_diagnostics.js") {
                    bytes = html
                        .replacen(
                            "<head>",
                            "<head><script src=\"/__jsdos_diagnostics.js\"></script>",
                            1,
                        )
                        .into_bytes();
                }
            }
            ([(header::CONTENT_TYPE, mime)], bytes).into_response()
        }
        Err(_) => StatusCode::NOT_FOUND.into_response(),
    }
}
async fn resource(preview: &Preview, path: &str) -> Result<(String, Vec<u8>)> {
    ensure!(
        path.starts_with('/') && path.len() <= 2048,
        "Invalid preview path"
    );
    if let Some(origin) = &preview.upstream {
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(15))
            .build()?;
        let mut response = client
            .get(format!("{}{path}", origin.trim_end_matches('/')))
            .send()
            .await?
            .error_for_status()?;
        let mime = response
            .headers()
            .get(header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .unwrap_or("application/octet-stream")
            .to_owned();
        let mut bytes = Vec::new();
        while let Some(chunk) = response.chunk().await? {
            ensure!(
                bytes.len() + chunk.len() <= crate::files::MAX_ZIP,
                "Preview resource too large"
            );
            bytes.extend(chunk);
        }
        return Ok((mime, bytes));
    }
    let name = path.split('?').next().unwrap().trim_start_matches('/');
    let name = if name.is_empty() { "index.html" } else { name };
    ensure!(
        !name
            .split('/')
            .any(|part| part.starts_with('.') || part == "node_modules"),
        "Private project path"
    );
    let selected = crate::checks::selected(&preview.root, name)?;
    ensure!(
        selected.metadata()?.len() <= crate::files::MAX_ZIP as u64,
        "Preview resource too large"
    );
    let mime = if name.ends_with(".html") {
        "text/html"
    } else if name.ends_with(".js") || name.ends_with(".mjs") {
        "text/javascript"
    } else if name.ends_with(".css") {
        "text/css"
    } else if name.ends_with(".wasm") {
        "application/wasm"
    } else if name.ends_with(".json") {
        "application/json"
    } else {
        "application/octet-stream"
    };
    Ok((mime.into(), tokio::fs::read(selected).await?))
}
async fn upgrade(
    State(preview): State<Arc<Preview>>,
    headers: HeaderMap,
    upgrade: WebSocketUpgrade,
) -> Response {
    if headers
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok())
        != Some(&preview.origin)
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    upgrade
        .max_message_size(16384)
        .max_frame_size(16384)
        .on_upgrade(|socket| events(preview, socket))
}
async fn events(preview: Arc<Preview>, mut socket: WebSocket) {
    let mut shutdown = preview.shutdown.subscribe();
    if *shutdown.borrow() {
        return;
    }
    let hello = tokio::select! { _ = shutdown.changed() => return,
    hello = tokio::time::timeout(Duration::from_secs(5), socket.recv()) => hello };
    let Ok(Some(Ok(Message::Text(hello)))) = hello else {
        return;
    };
    let Ok(hello) = serde_json::from_str::<Value>(&hello) else {
        return;
    };
    if hello["secret"].as_str() != Some(&preview.secret) {
        return;
    }
    preview.connected.store(true, Ordering::Relaxed);
    loop {
        let incoming = tokio::select! { _ = shutdown.changed() => break, incoming = socket.recv() => incoming };
        let Some(Ok(Message::Text(message))) = incoming else {
            break;
        };
        let Ok(event) = serde_json::from_str::<Value>(&message) else {
            break;
        };
        let kind = event["type"].as_str().unwrap_or("invalid");
        if ![
            "error",
            "unhandledrejection",
            "resource-error",
            "jsdos-error",
            "jsdos-created",
            "diagnostics-ready",
        ]
        .contains(&kind)
        {
            continue;
        }
        let mut events = preview.events.lock().await;
        if events.len() == 128 {
            events.pop_front();
            preview.truncated.store(true, Ordering::Relaxed);
        }
        events.push_back(json!({"type":kind,"detail":event["detail"].as_str().unwrap_or_default().replace(&preview.secret,"[redacted]").chars().take(4096).collect::<String>(),"at":event["at"]}));
    }
    preview.connected.store(false, Ordering::Relaxed);
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn injects_only_preview_and_rejects_non_loopback_upstream() {
        let root = tempfile::tempdir().unwrap();
        tokio::fs::write(
            root.path().join("index.html"),
            "<html><head></head><body>Project</body></html>",
        )
        .await
        .unwrap();
        assert!(
            Preview::start(root.path().into(), Some("https://example.com".into()))
                .await
                .is_err()
        );
        let running = Preview::start(root.path().into(), None).await.unwrap();
        let html = reqwest::get(&running.preview.origin)
            .await
            .unwrap()
            .text()
            .await
            .unwrap();
        assert!(html.contains("/__jsdos_diagnostics.js"));
        assert!(
            !tokio::fs::read_to_string(root.path().join("index.html"))
                .await
                .unwrap()
                .contains("diagnostics")
        );
        assert_eq!(
            running.preview.report().await["browser"]["status"],
            "not-run"
        );
        let origin = running.preview.origin.clone();
        drop(running);
        tokio::task::yield_now().await;
        assert!(reqwest::get(origin).await.is_err());
    }
}
