use chrono::{Datelike, NaiveDate};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::task::*,
    repository::tasks,
    state::AppState,
    validators::task::{validate_custom_days, validate_task_title},
};

pub async fn create_task(
    state: &AppState,
    user_id: Uuid,
    req: CreateTaskRequest,
) -> Result<Task, AppError> {
    validate_task_title(&req.title)?;
    if req.recurrence == TaskRecurrence::Custom {
        let days = req.custom_days.as_deref().unwrap_or(&[]);
        validate_custom_days(days)?;
    }

    let custom_days = req.custom_days.unwrap_or_default();
    tasks::create(
        &state.pool,
        user_id,
        &req.title,
        req.description.as_deref(),
        &req.recurrence,
        &custom_days,
        &req.category,
    )
    .await
}

pub async fn update_task(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
    req: UpdateTaskRequest,
) -> Result<Option<Task>, AppError> {
    if let Some(ref title) = req.title {
        validate_task_title(title)?;
    }
    if let Some(ref days) = req.custom_days {
        validate_custom_days(days)?;
    }

    tasks::update(
        &state.pool,
        task_id,
        user_id,
        req.title.as_deref(),
        req.description.as_deref(),
        req.recurrence.as_ref(),
        req.custom_days.as_deref(),
        req.category.as_ref(),
        req.is_active,
    )
    .await
}

pub async fn get_user_tasks(
    state: &AppState,
    user_id: Uuid,
) -> Result<Vec<Task>, AppError> {
    tasks::list_by_user(&state.pool, user_id).await
}

pub async fn get_task_by_id(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Task>, AppError> {
    tasks::find_by_id(&state.pool, task_id, user_id).await
}

pub async fn delete_task(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<u64, AppError> {
    tasks::delete(&state.pool, task_id, user_id).await
}

pub async fn toggle_task_completion(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<bool, AppError> {
    let task = tasks::find_by_id(&state.pool, task_id, user_id).await?;
    if task.is_none() {
        return Err(AppError::NotFound);
    }

    let completed_ids = tasks::get_completions_for_date(&state.pool, user_id, date).await?;
    let is_completed = completed_ids.contains(&task_id);

    if is_completed {
        tasks::uncomplete_task(&state.pool, task_id, user_id, date).await?;
        Ok(false)
    } else {
        tasks::complete_task(&state.pool, task_id, user_id, date).await?;
        Ok(true)
    }
}

pub async fn get_tasks_with_completion(
    state: &AppState,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<TaskWithCompletionStatus>, AppError> {
    let all_tasks = tasks::list_by_user(&state.pool, user_id).await?;
    let completed_ids = tasks::get_completions_for_date(&state.pool, user_id, date).await?;

    let weekday = date.weekday().num_days_from_monday() as i32;

    let filtered: Vec<TaskWithCompletionStatus> = all_tasks
        .into_iter()
        .filter(|task| task_is_scheduled(task, weekday))
        .map(|task| TaskWithCompletionStatus {
            completed_today: completed_ids.contains(&task.id),
            id: task.id,
            user_id: task.user_id,
            title: task.title,
            description: task.description,
            recurrence: task.recurrence,
            custom_days: task.custom_days,
            category: task.category,
            is_active: task.is_active,
            created_at: task.created_at,
            updated_at: task.updated_at,
        })
        .collect();

    Ok(filtered)
}

fn task_is_scheduled(task: &Task, weekday: i32) -> bool {
    match task.recurrence {
        TaskRecurrence::Daily => true,
        TaskRecurrence::Weekdays => (0..=4).contains(&weekday),
        TaskRecurrence::Weekly => {
            let created_weekday = task.created_at.weekday().num_days_from_monday() as i32;
            weekday == created_weekday
        }
        TaskRecurrence::Custom => task.custom_days.contains(&weekday),
    }
}

pub async fn get_completion_dates(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Vec<NaiveDate>, AppError> {
    tasks::get_completion_dates(&state.pool, task_id, user_id).await
}
