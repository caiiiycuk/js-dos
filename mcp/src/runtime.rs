use anyhow::{Context, Result, bail, ensure};
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
use futures_util::{SinkExt, StreamExt};
use serde_json::{Value, json};
use std::{
    collections::HashMap,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicU64, Ordering},
    },
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tokio::{
    net::TcpListener,
    sync::{Mutex, mpsc, oneshot},
    task::JoinHandle,
};
use uuid::Uuid;

include!(concat!(env!("OUT_DIR"), "/assets.rs"));
pub const MAX_MESSAGE: usize = 90 * 1024 * 1024;

type Pending = HashMap<u64, oneshot::Sender<Value>>;
#[derive(Default)]
pub struct Snapshots {
    pub original: Option<Vec<u8>>,
    pub last: Option<Vec<u8>>,
}
pub struct Runtime {
    pub origin: String,
    pub(crate) secret: String,
    session: String,
    next: AtomicU64,
    connected_before: AtomicBool,
    connection: Mutex<Option<(String, mpsc::Sender<Value>)>>,
    pending: Mutex<Pending>,
    shutdown: tokio::sync::watch::Sender<bool>,
    pub snapshots: Mutex<Snapshots>,
}

impl Runtime {
    pub async fn open_browser(&self) -> Result<()> {
        #[cfg(target_os = "linux")]
        let mut command = tokio::process::Command::new("xdg-open");
        #[cfg(target_os = "macos")]
        let mut command = tokio::process::Command::new("/usr/bin/open");
        #[cfg(windows)]
        let mut command = {
            let mut command = tokio::process::Command::new("cmd.exe");
            command.args(["/D", "/C", "start", ""]);
            command
        };
        command
            .arg(self.browser_url())
            .stdin(std::process::Stdio::null())
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .kill_on_drop(true);
        let mut child = command.spawn()?;
        let status = tokio::time::timeout(Duration::from_secs(5), child.wait())
            .await
            .context("Browser opener timed out; use the returned URL")??;
        ensure!(
            status.success(),
            "Browser opener failed; use the returned URL"
        );
        Ok(())
    }
    pub async fn start() -> Result<(Arc<Self>, JoinHandle<()>)> {
        let listener = TcpListener::bind("127.0.0.1:0").await?;
        let runtime = Arc::new(Self {
            origin: format!("http://{}", listener.local_addr()?),
            secret: Uuid::new_v4().to_string(),
            session: Uuid::new_v4().to_string(),
            next: AtomicU64::new(1),
            connected_before: AtomicBool::new(false),
            connection: Mutex::new(None),
            pending: Mutex::new(HashMap::new()),
            shutdown: tokio::sync::watch::channel(false).0,
            snapshots: Mutex::new(Snapshots::default()),
        });
        let app = Router::new()
            .route("/bridge", get(upgrade))
            .fallback(get(asset))
            .layer(middleware::from_fn_with_state(runtime.clone(), guard))
            .with_state(runtime.clone());
        let task = tokio::spawn(async move {
            if let Err(error) = axum::serve(listener, app).await {
                eprintln!("Local HTTP server stopped: {error}");
            }
        });
        Ok((runtime, task))
    }
    pub async fn status(&self) -> Value {
        json!({"url":self.origin, "connection":if self.connection.lock().await.is_some() {"connected"} else if self.connected_before.load(Ordering::Relaxed) {"disconnected"} else {"waiting"},
            "recovery":"Only the original import and last confirmed full snapshot survive a closed tab. Unsaved browser memory is not recovered."})
    }
    pub fn shutdown(&self) {
        self.shutdown.send_replace(true);
    }
    pub fn browser_url(&self) -> String {
        format!("{}/#{}", self.origin, self.secret)
    }
    pub async fn call(&self, operation: &str, arguments: Value, mutation: bool) -> Result<Value> {
        let connection = self.connection.lock().await;
        let (generation, sender) = connection
            .as_ref()
            .context("Studio is not connected; open Studio first")?;
        let generation = generation.clone();
        let sender = sender.clone();
        let id = self.next.fetch_add(1, Ordering::Relaxed);
        let deadline = SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis() + 60000;
        let request = json!({"id":id, "session":self.session, "connection":generation,
            "deadline":deadline, "operation":operation, "arguments":arguments});
        ensure!(
            serde_json::to_vec(&request)?.len() <= MAX_MESSAGE,
            "Message exceeds 90 MiB limit"
        );
        let (send, receive) = oneshot::channel();
        self.pending.lock().await.insert(id, send);
        drop(connection);
        let result = tokio::time::timeout(Duration::from_secs(60), async {
            sender.send(request).await.context("Studio disconnected")?;
            receive.await.context("Studio disconnected")
        })
        .await;
        self.pending.lock().await.remove(&id);
        match result {
            Ok(Ok(response)) => {
                if let Some(error) = response.get("error") {
                    bail!("{error}");
                }
                Ok(response["result"].clone())
            }
            other => bail!(
                "{}; {}",
                match other {
                    Ok(Err(error)) => error.to_string(),
                    _ => "Studio request timed out".into(),
                },
                if mutation {
                    "outcome unknown; read state before retrying; command was not replayed"
                } else {
                    "read was not completed"
                }
            ),
        }
    }
}

async fn guard(
    State(runtime): State<Arc<Runtime>>,
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
    let host = request
        .headers()
        .get(header::HOST)
        .and_then(|value| value.to_str().ok());
    let origin = request
        .headers()
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok());
    if host != Some(runtime.origin.trim_start_matches("http://"))
        || origin.is_some_and(|value| value != runtime.origin)
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    let mut response = next.run(request).await;
    for (name, value) in [
        ("cross-origin-opener-policy", "same-origin"),
        ("cross-origin-embedder-policy", "require-corp"),
        ("cross-origin-resource-policy", "same-origin"),
        ("referrer-policy", "no-referrer"),
        ("x-content-type-options", "nosniff"),
        ("cache-control", "no-store"),
        (
            "content-security-policy",
            "default-src 'self'; script-src 'self' blob: 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'",
        ),
    ] {
        response.headers_mut().insert(name, value.parse().unwrap());
    }
    response
}

async fn asset(request: Request<Body>) -> Response {
    let name = request.uri().path().trim_start_matches('/');
    let name = if name.is_empty() { "index.html" } else { name };
    let Some((_, bytes)) = ASSETS.iter().find(|(path, _)| *path == name) else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let mime = if name.ends_with(".js") {
        "text/javascript"
    } else if name.ends_with(".wasm") {
        "application/wasm"
    } else if name.ends_with(".css") {
        "text/css"
    } else if name.ends_with(".html") {
        "text/html"
    } else if name.ends_with(".json") {
        "application/json"
    } else {
        "text/plain"
    };
    ([(header::CONTENT_TYPE, mime)], *bytes).into_response()
}

async fn upgrade(
    State(runtime): State<Arc<Runtime>>,
    headers: HeaderMap,
    upgrade: WebSocketUpgrade,
) -> Response {
    if headers
        .get(header::ORIGIN)
        .and_then(|value| value.to_str().ok())
        != Some(&runtime.origin)
    {
        return StatusCode::FORBIDDEN.into_response();
    }
    upgrade
        .max_message_size(MAX_MESSAGE)
        .max_frame_size(MAX_MESSAGE)
        .on_upgrade(|socket| connection(runtime, socket))
}

async fn connection(runtime: Arc<Runtime>, mut socket: WebSocket) {
    let mut shutdown = runtime.shutdown.subscribe();
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
    if hello["secret"].as_str() != Some(&runtime.secret) {
        return;
    }
    let mut active = runtime.connection.lock().await;
    if active.is_some() {
        let _ = socket.close().await;
        return;
    }
    let generation = Uuid::new_v4().to_string();
    let (sender, mut receive) = mpsc::channel::<Value>(8);
    if socket
        .send(Message::Text(
            json!({"session":runtime.session,"connection":generation})
                .to_string()
                .into(),
        ))
        .await
        .is_err()
    {
        return;
    }
    *active = Some((generation.clone(), sender));
    runtime.connected_before.store(true, Ordering::Relaxed);
    drop(active);
    loop {
        tokio::select! {
            _ = shutdown.changed() => break,
            outgoing = receive.recv() => {
                let Some(outgoing) = outgoing else { break; };
                if socket.send(Message::Text(outgoing.to_string().into())).await.is_err() { break; }
            }
            incoming = socket.next() => {
                let incoming = match incoming {
                    Some(Ok(Message::Text(text))) => text,
                    Some(Ok(Message::Ping(_) | Message::Pong(_))) => continue,
                    _ => break,
                };
                let Ok(response) = serde_json::from_str::<Value>(&incoming) else { break; };
                if response["session"] != runtime.session || response["connection"] != generation { continue; }
                if let Some(id) = response["id"].as_u64()
                    && let Some(sender) = runtime.pending.lock().await.remove(&id) {
                    let response = serde_json::from_str(&response.to_string().replace(&runtime.secret, "[redacted]")).unwrap();
                    let _ = sender.send(response);
                }
            }
        }
    }
    let mut active = runtime.connection.lock().await;
    *active = None;
    runtime.pending.lock().await.clear();
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio_tungstenite::{
        connect_async,
        tungstenite::{Message as ClientMessage, client::IntoClientRequest},
    };

    async fn http(runtime: &Runtime, host: &str, origin: &str) -> String {
        let mut stream =
            tokio::net::TcpStream::connect(runtime.origin.trim_start_matches("http://"))
                .await
                .unwrap();
        stream.write_all(format!("GET / HTTP/1.1\r\nHost: {host}\r\nOrigin: {origin}\r\nConnection: close\r\n\r\n").as_bytes()).await.unwrap();
        let mut result = String::new();
        stream.read_to_string(&mut result).await.unwrap();
        result
    }
    async fn client(
        runtime: &Runtime,
        origin: &str,
    ) -> Result<
        tokio_tungstenite::WebSocketStream<
            tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
        >,
    > {
        let mut request =
            format!("{}/bridge", runtime.origin.replace("http:", "ws:")).into_client_request()?;
        request.headers_mut().insert("Origin", origin.parse()?);
        Ok(connect_async(request).await?.0)
    }

    #[tokio::test]
    async fn host_origin_secret_isolation_and_reconnect() {
        let (runtime, task) = Runtime::start().await.unwrap();
        let (other, other_task) = Runtime::start().await.unwrap();
        assert_ne!(runtime.origin, other.origin);
        assert_ne!(runtime.secret, other.secret);
        assert_eq!(runtime.status().await["connection"], "waiting");
        assert!(
            http(&runtime, "evil.invalid", &runtime.origin)
                .await
                .starts_with("HTTP/1.1 403")
        );
        assert!(
            http(
                &runtime,
                runtime.origin.trim_start_matches("http://"),
                "https://evil.invalid"
            )
            .await
            .starts_with("HTTP/1.1 403")
        );
        assert!(client(&runtime, &other.origin).await.is_err());
        let mut bad = client(&runtime, &runtime.origin).await.unwrap();
        bad.send(ClientMessage::Text(
            json!({"secret":other.secret}).to_string().into(),
        ))
        .await
        .unwrap();
        assert!(matches!(
            bad.next().await,
            None | Some(Err(_)) | Some(Ok(ClientMessage::Close(_)))
        ));
        let mut browser = client(&runtime, &runtime.origin).await.unwrap();
        browser
            .send(ClientMessage::Text(
                json!({"secret":runtime.secret}).to_string().into(),
            ))
            .await
            .unwrap();
        let welcome: Value =
            serde_json::from_str(browser.next().await.unwrap().unwrap().to_text().unwrap())
                .unwrap();
        let command = {
            let runtime = runtime.clone();
            tokio::spawn(async move { runtime.call("config", json!({}), true).await })
        };
        let request: Value =
            serde_json::from_str(browser.next().await.unwrap().unwrap().to_text().unwrap())
                .unwrap();
        assert_eq!(request["connection"], welcome["connection"]);
        browser.close(None).await.unwrap();
        assert!(
            command
                .await
                .unwrap()
                .unwrap_err()
                .to_string()
                .contains("outcome unknown")
        );
        assert!(runtime.pending.lock().await.is_empty());
        assert_eq!(runtime.status().await["connection"], "disconnected");
        let mut reconnected = client(&runtime, &runtime.origin).await.unwrap();
        reconnected
            .send(ClientMessage::Text(
                json!({"secret":runtime.secret}).to_string().into(),
            ))
            .await
            .unwrap();
        let second: Value = serde_json::from_str(
            reconnected
                .next()
                .await
                .unwrap()
                .unwrap()
                .to_text()
                .unwrap(),
        )
        .unwrap();
        assert_ne!(second["connection"], welcome["connection"]);
        let read = {
            let runtime = runtime.clone();
            tokio::spawn(async move { runtime.call("state", json!({}), false).await })
        };
        let request: Value = serde_json::from_str(
            reconnected
                .next()
                .await
                .unwrap()
                .unwrap()
                .to_text()
                .unwrap(),
        )
        .unwrap();
        let late = json!({"id":request["id"],"session":welcome["session"],"connection":welcome["connection"],"result":"late"});
        reconnected
            .send(ClientMessage::Text(late.to_string().into()))
            .await
            .unwrap();
        let response = json!({"id":request["id"],"session":second["session"],"connection":second["connection"],"result":"current"});
        reconnected
            .send(ClientMessage::Text(response.to_string().into()))
            .await
            .unwrap();
        assert_eq!(read.await.unwrap().unwrap(), "current");
        let timed_out = {
            let runtime = runtime.clone();
            tokio::spawn(async move { runtime.call("config", json!({}), true).await })
        };
        reconnected.next().await.unwrap().unwrap();
        tokio::time::pause();
        tokio::time::advance(Duration::from_secs(61)).await;
        assert!(
            timed_out
                .await
                .unwrap()
                .unwrap_err()
                .to_string()
                .contains("outcome unknown")
        );
        tokio::time::resume();
        assert!(runtime.pending.lock().await.is_empty());
        assert!(!runtime.status().await.to_string().contains(&runtime.secret));
        task.abort();
        other_task.abort();
        task.await.unwrap_err();
        other_task.await.unwrap_err();
        assert!(
            tokio::net::TcpStream::connect(runtime.origin.trim_start_matches("http://"))
                .await
                .is_err()
        );
    }
}
