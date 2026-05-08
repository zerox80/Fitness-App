use chrono::{NaiveDate, Utc};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{
        ActivityEntriesResponse, ActivityEntry, CreateActivityEntriesRequest, DailyActivity,
        UserStats, WeeklyActivitySummary,
    },
    repository::activity,
    state::AppState,
    utils::time::week_start,
};

pub async fn get_user_stats(state: &AppState, user_id: Uuid) -> Result<UserStats, AppError> {
    activity::get_stats(&state.pool, user_id).await
}

pub async fn get_activity_for_date(
    state: &AppState,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<DailyActivity, AppError> {
    activity::get_today(&state.pool, user_id, date).await
}

pub async fn get_weekly_summary(
    state: &AppState,
    user_id: Uuid,
) -> Result<WeeklyActivitySummary, AppError> {
    let today = Utc::now().date_naive();
    let start = week_start(today);
    activity::get_weekly_summary(&state.pool, user_id, start).await
}

pub async fn get_activity_entries_for_date(
    state: &AppState,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<ActivityEntry>, AppError> {
    activity::list_entries(&state.pool, user_id, date).await
}

pub async fn create_activity_entries(
    state: &AppState,
    user_id: Uuid,
    req: CreateActivityEntriesRequest,
) -> Result<ActivityEntriesResponse, AppError> {
    req.validate().map_err(AppError::Validation)?;
    activity::create_entries(&state.pool, user_id, req.date, &req.entries).await?;
    entries_response_for_date(state, user_id, req.date).await
}

pub async fn delete_activity_entry(
    state: &AppState,
    user_id: Uuid,
    entry_id: Uuid,
) -> Result<ActivityEntriesResponse, AppError> {
    let date = activity::delete_entry(&state.pool, entry_id, user_id)
        .await?
        .ok_or(AppError::NotFound)?;

    entries_response_for_date(state, user_id, date).await
}

async fn entries_response_for_date(
    state: &AppState,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<ActivityEntriesResponse, AppError> {
    let (activity, entries) = tokio::try_join!(
        get_activity_for_date(state, user_id, date),
        get_activity_entries_for_date(state, user_id, date)
    )?;

    Ok(ActivityEntriesResponse { activity, entries })
}
