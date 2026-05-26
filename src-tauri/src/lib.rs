mod qr_server;

use std::sync::Mutex;
use tauri::{Manager, State};

struct AppState {
    server: Mutex<Option<qr_server::QrServerHandle>>,
}

#[tauri::command]
fn start_qr_server(image_bytes: Vec<u8>, state: State<AppState>) -> Result<String, String> {
    let mut guard = state.server.lock().map_err(|e| e.to_string())?;
    if let Some(h) = guard.take() {
        h.stop();
    }
    let handle = qr_server::start(image_bytes)?;
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
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(AppState {
                server: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_qr_server, stop_qr_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
