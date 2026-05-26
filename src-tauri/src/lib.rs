mod qr_server;

use base64::Engine;
use std::sync::Mutex;
use tauri::{Manager, State};

struct AppState {
    server: Mutex<Option<qr_server::QrServerHandle>>,
}

fn decode_data_url(data_url: &str) -> Result<Vec<u8>, String> {
    let comma = data_url
        .find(',')
        .ok_or_else(|| "invalid data url (no comma)".to_string())?;
    let b64 = &data_url[comma + 1..];
    base64::engine::general_purpose::STANDARD
        .decode(b64.as_bytes())
        .map_err(|e| format!("base64 decode failed: {e}"))
}

#[tauri::command]
fn save_png_to_path(path: String, data_url: String) -> Result<(), String> {
    let bytes = decode_data_url(&data_url)?;
    std::fs::write(&path, bytes).map_err(|e| format!("write failed: {e}"))
}

#[tauri::command]
fn start_qr_server(data_url: String, state: State<AppState>) -> Result<String, String> {
    let bytes = decode_data_url(&data_url)?;
    let mut guard = state.server.lock().map_err(|e| e.to_string())?;
    if let Some(h) = guard.take() {
        h.stop();
    }
    let handle = qr_server::start(bytes)?;
    let url = handle.url.clone();
    *guard = Some(handle);
    Ok(url)
}

#[tauri::command]
fn stop_qr_server(state: State<AppState>) -> Result<(), String> {
    let mut guard = state.server.lock().map_err(|e| e.to_string())?;
    if let Some(h) = guard.take() {
        h.stop();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(AppState {
                server: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_png_to_path,
            start_qr_server,
            stop_qr_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
