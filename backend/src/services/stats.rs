use chrono::Utc;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{DailyActivity, UserStats, WeeklyActivitySummary},
    repository::activity,
    state::AppState,
    utils::time::week_start,
};

pub async fn get_user_stats(state: &AppState, user_id: Uuid) -> Result<UserStats, AppError> {
    activity::get_stats(&state.pool, user_id).await
}

pub async fn get_today_activity(
    state: &AppState,
    user_id: Uuid,
) -> Result<DailyActivity, AppError> {
    let today = Utc::now().date_naive();

    let activity = activity::get_today(&state.pool, user_id, today)
        .await?
        .unwrap_or(DailyActivity {
            steps: 0,
            calories: 0,
            active_minutes: 0,
            move_progress: 0.0,
            exercise_progress: 0.0,
            stand_progress: 0.0,
        });

    Ok(activity)
}

pub async fn get_weekly_summary(
    state: &AppState,
    user_id: Uuid,
) -> Result<WeeklyActivitySummary, AppError> {
    let today = Utc::now().date_naive();
    let start = week_start(today);
    activity::get_weekly_summary(&state.pool, user_id, start).await
}
