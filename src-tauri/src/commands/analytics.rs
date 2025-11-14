use std::sync::Mutex;

use utils::Error;

use crate::app::client::AppState;

#[tauri::command]
pub fn analytics_set_last_user_activity(
    _app: tauri::State<'_, Mutex<AppState>>,
) -> Result<(), Error> {
    // Analytics disabled - no-op
    Ok(())
}

#[tauri::command]
pub fn analytics_add_metric(
    _key: String,
    _value: String,
    _app: tauri::State<'_, Mutex<AppState>>,
) -> Result<(), Error> {
    // Analytics disabled - no-op
    Ok(())
}
