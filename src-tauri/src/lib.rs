use base64::Engine;

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

/// Escape a string for inclusion inside an AppleScript double-quoted literal.
fn esc_apple(s: &str) -> String {
    s.replace('\\', r"\\").replace('"', r#"\""#)
}

#[tauri::command]
fn email_image(
    data_url: String,
    subject: String,
    body: String,
    to: Option<String>,
) -> Result<(), String> {
    if !cfg!(target_os = "macos") {
        return Err("Email composition is only supported on macOS for now.".into());
    }

    let bytes = decode_data_url(&data_url)?;
    let dir = std::env::temp_dir();
    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let path = dir.join(format!("photo-booth-{ts}.png"));
    std::fs::write(&path, bytes).map_err(|e| format!("temp write failed: {e}"))?;
    let path_str = path.to_string_lossy().to_string();

    let recipient_block = match to.as_deref().filter(|s| !s.trim().is_empty()) {
        Some(addr) => format!(
            r#"make new to recipient at end of to recipients with properties {{address:"{}"}}"#,
            esc_apple(addr.trim())
        ),
        None => String::new(),
    };

    let script = format!(
        r#"tell application "Mail"
    activate
    set newMsg to make new outgoing message with properties {{subject:"{subject}", content:"{body}", visible:true}}
    tell newMsg
        {recipient_block}
        make new attachment with properties {{file name:POSIX file "{path}"}} at after the last paragraph of content
    end tell
end tell"#,
        subject = esc_apple(&subject),
        body = esc_apple(&body),
        recipient_block = recipient_block,
        path = esc_apple(&path_str),
    );

    let status = std::process::Command::new("osascript")
        .args(["-e", &script])
        .status()
        .map_err(|e| format!("failed to launch osascript: {e}"))?;

    if !status.success() {
        return Err(format!(
            "Mail couldn't open the draft (exit {:?})",
            status.code()
        ));
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_png_to_path, email_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
