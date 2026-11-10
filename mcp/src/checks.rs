use anyhow::{Context, Result, ensure};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::{Path, PathBuf},
    process::Stdio,
    sync::{Arc, Mutex},
    time::Duration,
};
use tokio::{io::AsyncReadExt, process::Command};

pub fn selected(root: &Path, name: &str) -> Result<PathBuf> {
    crate::files::relative(name)?;
    let mut path = root.to_path_buf();
    for component in name.split('/') {
        path.push(component);
        ensure!(
            !fs::symlink_metadata(&path)?.file_type().is_symlink(),
            "Project links are forbidden"
        );
    }
    ensure!(
        path.canonicalize()?.starts_with(root),
        "Path escapes project root"
    );
    Ok(path)
}

pub fn manifest(root: &Path) -> Result<Value> {
    let marker: Value = serde_json::from_slice(&fs::read(selected(root, "jsdos-project.json")?)?)?;
    let runtime = marker["runtime"].as_str().context("Missing runtime path")?;
    let manifest: Value = serde_json::from_slice(&fs::read(selected(
        root,
        &format!("{runtime}/manifest.json"),
    )?)?)?;
    let files = manifest["files"]
        .as_array()
        .context("Invalid runtime manifest")?;
    ensure!(
        files.len() <= crate::files::MAX_FILES,
        "Too many manifest entries"
    );
    let mut issues = Vec::new();
    for file in files {
        let name = file["path"].as_str().context("Missing manifest path")?;
        let path = format!("{runtime}/{name}");
        match selected(root, &path).and_then(|path| {
            ensure!(fs::metadata(&path)?.len() <= crate::files::MAX_EXPANDED, "Resource exceeds limit");
            Ok(fs::read(path)?)
        }) {
            Ok(bytes) if file["size"].as_u64() == Some(bytes.len() as u64) && file["sha256"].as_str() == Some(&format!("{:x}", Sha256::digest(&bytes))) => {},
            Ok(_) => issues.push(json!({"path":path,"code":"checksum-mismatch"})),
            Err(error) => issues.push(json!({"path":path,"code":"missing-or-unsafe-resource","message":error.to_string()})),
        }
    }
    let bundle = if marker["preset"] == "html" {
        "bundle.jsdos"
    } else {
        "public/bundle.jsdos"
    };
    match selected(root, bundle).and_then(|path| crate::files::read(&path)) {
        Ok(_) => {}
        Err(error) => {
            issues.push(json!({"path":bundle,"code":"invalid-bundle","message":error.to_string()}))
        }
    }
    Ok(
        json!({"status":if issues.is_empty() {"valid"} else {"invalid"},"issues":issues,"preset":marker["preset"],"checkedFiles":files.len()}),
    )
}

#[derive(Default)]
pub struct Processes(pub Mutex<Vec<tokio::sync::oneshot::Sender<()>>>);
impl Processes {
    pub fn shutdown(&self) {
        for sender in self.0.lock().unwrap().drain(..) {
            let _ = sender.send(());
        }
    }
}
impl Drop for Processes {
    fn drop(&mut self) {
        self.shutdown();
    }
}

async fn output(mut pipe: impl tokio::io::AsyncRead + Unpin) -> Result<(String, bool)> {
    let mut result = Vec::new();
    let mut buffer = [0; 8192];
    let mut truncated = false;
    loop {
        let size = pipe.read(&mut buffer).await?;
        if size == 0 {
            break;
        }
        let accepted = size.min(65536usize.saturating_sub(result.len()));
        result.extend_from_slice(&buffer[..accepted]);
        truncated |= accepted != size;
    }
    Ok((String::from_utf8_lossy(&result).into(), truncated))
}

pub async fn verify(
    root: &Path,
    permission: bool,
    timeout: u32,
    processes: Arc<Processes>,
) -> Result<Value> {
    ensure!(
        (1..=120).contains(&timeout),
        "Build timeout must be 1..120 seconds"
    );
    let root = root.canonicalize()?;
    let static_report = manifest(&root)?;
    if !permission {
        return Ok(
            json!({"static":static_report,"build":{"status":"not-run","reason":"script execution permission not granted"},"browser":{"status":"not-run"}}),
        );
    }
    if static_report["preset"] == "html" {
        return Ok(
            json!({"static":static_report,"build":{"status":"not-applicable"},"browser":{"status":"not-run"}}),
        );
    }
    if !root.join("node_modules").is_dir() {
        return Ok(
            json!({"static":static_report,"build":{"status":"missing-dependencies"},"browser":{"status":"not-run"}}),
        );
    }
    #[cfg(not(windows))]
    let mut command = {
        let mut command = Command::new("npm");
        command.args(["run", "build"]);
        command
    };
    #[cfg(windows)]
    let mut command = {
        let mut command = Command::new("cmd.exe");
        command.args(["/D", "/S", "/C", "npm run build"]);
        command
    };
    command
        .current_dir(&root)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    let mut command = process_wrap::tokio::CommandWrap::from(command);
    command.wrap(process_wrap::tokio::KillOnDrop);
    #[cfg(unix)]
    command.wrap(process_wrap::tokio::ProcessGroup::leader());
    #[cfg(windows)]
    command.wrap(process_wrap::tokio::JobObject);
    let (cancel, cancelled) = tokio::sync::oneshot::channel();
    {
        let mut active = processes.0.lock().unwrap();
        active.retain(|sender| !sender.is_closed());
        ensure!(active.len() < 2, "At most two builds may run concurrently");
        active.push(cancel);
    }
    let mut child = ProcessTree(Some(match command.spawn() {
        Ok(child) => child,
        Err(error) => {
            return Ok(
                json!({"static":static_report,"build":{"status":"toolchain-unavailable","message":error.to_string()},"browser":{"status":"not-run"}}),
            );
        }
    }));
    let stdout = tokio::spawn(output(child.0.as_mut().unwrap().stdout().take().unwrap()));
    let stderr = tokio::spawn(output(child.0.as_mut().unwrap().stderr().take().unwrap()));
    let status = tokio::select! {
        status = tokio::time::timeout(Duration::from_secs(timeout.into()), child.0.as_mut().unwrap().wait()) => status,
        _ = cancelled => return Ok(json!({"static":static_report,"build":{"status":"cancelled"},"browser":{"status":"not-run"}})),
    };
    let mut child = child.0.take().unwrap();
    let _ = child.start_kill();
    let _ = child.wait().await;
    let stdout = stdout.await??;
    let stderr = stderr.await??;
    let (status, code) = match status {
        Ok(Ok(status)) => (
            if status.success() { "passed" } else { "failed" },
            status.code(),
        ),
        Ok(Err(_)) => ("failed", None),
        Err(_) => ("timeout", None),
    };
    Ok(
        json!({"static":static_report,"build":{"status":status,"exitCode":code,"stdout":stdout.0,"stderr":stderr.0,"truncated":stdout.1 || stderr.1},"browser":{"status":"not-run"}}),
    )
}

struct ProcessTree(Option<Box<dyn process_wrap::tokio::ChildWrapper>>);

impl Drop for ProcessTree {
    fn drop(&mut self) {
        // SAFETY: Tokio's kill_on_drop kills only the Unix leader, not its process group.
        if let Some(child) = self.0.as_mut() {
            let _ = child.start_kill();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn cancellation_terminates_descendants() {
        let root = tempfile::tempdir().unwrap();
        let project = root.path().join("project");
        crate::project::generate(
            &project,
            "vite",
            &crate::files::create("[autoexec]").unwrap(),
        )
        .unwrap();
        fs::create_dir(project.join("node_modules")).unwrap();
        fs::write(project.join("package.json"), r#"{"scripts":{"build":"node -e \"const fs=require('fs');setInterval(()=>fs.appendFileSync('alive','x'),10)\""}}"#).unwrap();
        let folder = project.clone();
        let running = tokio::spawn(async move {
            verify(&folder, true, 120, Arc::new(Processes::default())).await
        });
        let deadline = std::time::Instant::now() + Duration::from_secs(15);
        while !project.join("alive").exists() {
            assert!(std::time::Instant::now() < deadline);
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
        running.abort();
        assert!(running.await.unwrap_err().is_cancelled());
        tokio::time::sleep(Duration::from_millis(100)).await;
        let size = fs::metadata(project.join("alive")).unwrap().len();
        tokio::time::sleep(Duration::from_millis(100)).await;
        assert_eq!(fs::metadata(project.join("alive")).unwrap().len(), size);
    }
    #[tokio::test]
    async fn static_missing_dependencies_failure_and_permission() {
        let root = tempfile::tempdir().unwrap();
        let project = root.path().join("project");
        crate::project::generate(
            &project,
            "vite",
            &crate::files::create("[autoexec]").unwrap(),
        )
        .unwrap();
        let processes = Arc::new(Processes::default());
        assert_eq!(
            verify(&project, false, 10, processes.clone())
                .await
                .unwrap()["build"]["status"],
            "not-run"
        );
        assert_eq!(
            verify(&project, true, 10, processes.clone()).await.unwrap()["build"]["status"],
            "missing-dependencies"
        );
        fs::create_dir(project.join("node_modules")).unwrap();
        fs::write(
            project.join("package.json"),
            r#"{"scripts":{"build":"node -e \"process.exit(7)\""}}"#,
        )
        .unwrap();
        assert_eq!(
            verify(&project, true, 10, processes.clone()).await.unwrap()["build"]["status"],
            "failed"
        );
        fs::write(project.join("package.json"), r#"{"scripts":{"build":"node -e \"console.log('x'.repeat(70000));setTimeout(()=>{},100000)\""}}"#).unwrap();
        let report = verify(&project, true, 1, processes).await.unwrap();
        assert_eq!(report["build"]["status"], "timeout");
        assert_eq!(report["build"]["truncated"], true);
        fs::remove_file(project.join("public/runtime/emulators/wdosbox.wasm")).unwrap();
        assert_eq!(manifest(&project).unwrap()["status"], "invalid");
    }
}
