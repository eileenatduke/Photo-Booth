use rand::Rng;
use std::io::Cursor;
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use std::thread;
use tiny_http::{Header, Response, Server};

pub struct QrServerHandle {
    pub url: String,
    shutdown: Arc<Mutex<bool>>,
    server: Arc<Server>,
}

impl QrServerHandle {
    pub fn stop(&self) {
        *self.shutdown.lock().unwrap() = true;
        self.server.unblock();
    }
}

fn random_id() -> String {
    let mut rng = rand::thread_rng();
    const CHARS: &[u8] = b"abcdefghijklmnopqrstuvwxyz0123456789";
    (0..12)
        .map(|_| CHARS[rng.gen_range(0..CHARS.len())] as char)
        .collect()
}

fn pick_port() -> Option<u16> {
    let listener = TcpListener::bind("0.0.0.0:0").ok()?;
    let port = listener.local_addr().ok()?.port();
    drop(listener);
    Some(port)
}

fn lan_ip() -> String {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string())
}

pub fn start(image_bytes: Vec<u8>) -> Result<QrServerHandle, String> {
    let port = pick_port().ok_or_else(|| "Could not pick a free port".to_string())?;
    let bind = format!("0.0.0.0:{port}");
    let server = Server::http(&bind).map_err(|e| format!("server bind failed: {e}"))?;
    let server = Arc::new(server);

    let id = random_id();
    let path = format!("/{id}.png");
    let ip = lan_ip();
    let url = format!("http://{ip}:{port}{path}");

    let shutdown = Arc::new(Mutex::new(false));
    let shutdown_clone = shutdown.clone();
    let server_clone = server.clone();
    let bytes = Arc::new(image_bytes);
    let target_path = path.clone();

    thread::spawn(move || {
        for request in server_clone.incoming_requests() {
            if *shutdown_clone.lock().unwrap() {
                break;
            }
            let req_path = request.url().to_string();
            if req_path == target_path {
                let data = bytes.clone();
                let cursor = Cursor::new((*data).clone());
                let response = Response::new(
                    200.into(),
                    vec![
                        Header::from_bytes(&b"Content-Type"[..], &b"image/png"[..]).unwrap(),
                        Header::from_bytes(
                            &b"Cache-Control"[..],
                            &b"no-store, must-revalidate"[..],
                        )
                        .unwrap(),
                    ],
                    cursor,
                    Some(data.len()),
                    None,
                );
                let _ = request.respond(response);
            } else {
                let _ = request.respond(Response::from_string("not found").with_status_code(404));
            }
        }
    });

    Ok(QrServerHandle {
        url,
        shutdown,
        server,
    })
}
