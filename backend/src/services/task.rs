use chrono::{Datelike, NaiveDate};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::task::*,
    repository::tasks,
    state::AppState,
    validators::task::{validate_custom_days, validate_target_sets, validate_task_title},
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
    let target_sets = req.target_sets.unwrap_or(1);
    validate_target_sets(target_sets)?;

    tasks::create(
        &state.pool,
        tasks::CreateTaskParams {
            user_id,
            title: &req.title,
            description: req.description.as_deref(),
            recurrence: &req.recurrence,
            custom_days: &custom_days,
            category: &req.category,
            target_sets,
        },
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
    if let Some(target_sets) = req.target_sets {
        validate_target_sets(target_sets)?;
    }

    tasks::update(
        &state.pool,
        tasks::UpdateTaskParams {
            id: task_id,
            user_id,
            title: req.title.as_deref(),
            description: req.description.as_deref(),
            recurrence: req.recurrence.as_ref(),
            custom_days: req.custom_days.as_deref(),
            category: req.category.as_ref(),
            is_active: req.is_active,
            target_sets: req.target_sets,
        },
    )
    .await
}

pub async fn get_user_tasks(state: &AppState, user_id: Uuid) -> Result<Vec<Task>, AppError> {
    tasks::list_by_user(&state.pool, user_id).await
}

pub async fn get_task_by_id(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Task>, AppError> {
    tasks::find_by_id(&state.pool, task_id, user_id).await
}

pub async fn delete_task(state: &AppState, task_id: Uuid, user_id: Uuid) -> Result<u64, AppError> {
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

    let completed_ids_with_sets =
        tasks::get_completions_for_date(&state.pool, user_id, date).await?;
    let existing_completion = completed_ids_with_sets
        .iter()
        .find(|(id, _)| *id == task_id);

    if let Some((_, _)) = existing_completion {
        tasks::uncomplete_task(&state.pool, task_id, user_id, date).await?;
        Ok(false)
    } else {
        tasks::complete_task(&state.pool, task_id, user_id, date, 1).await?;
        Ok(true)
    }
}

pub async fn increment_task_set(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<i32, AppError> {
    let task = tasks::find_by_id(&state.pool, task_id, user_id).await?;
    let task = task.ok_or(AppError::NotFound)?;

    let completed_ids_with_sets =
        tasks::get_completions_for_date(&state.pool, user_id, date).await?;
    let existing_sets = completed_ids_with_sets
        .iter()
        .find(|(id, _)| *id == task_id)
        .map(|(_, sets)| *sets)
        .unwrap_or(0);

    let new_sets = next_completed_sets(existing_sets, task.target_sets);

    tasks::complete_task(&state.pool, task_id, user_id, date, new_sets).await?;

    Ok(new_sets)
}

pub async fn get_tasks_with_completion(
    state: &AppState,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<TaskWithCompletionStatus>, AppError> {
    let all_tasks = tasks::list_by_user(&state.pool, user_id).await?;
    let completed_ids_with_sets =
        tasks::get_completions_for_date(&state.pool, user_id, date).await?;

    let weekday = date.weekday().num_days_from_monday() as i32;

    let filtered: Vec<TaskWithCompletionStatus> = all_tasks
        .into_iter()
        .filter(|task| task_is_scheduled(task, weekday))
        .map(|task| {
            let completion = completed_ids_with_sets
                .iter()
                .find(|(id, _)| *id == task.id);
            let completed_sets_today = completion.map(|(_, sets)| *sets).unwrap_or(0);
            let completed_today =
                task_completion_is_complete(completed_sets_today, task.target_sets);

            TaskWithCompletionStatus {
                completed_today,
                completed_sets_today,
                id: task.id,
                user_id: task.user_id,
                title: task.title,
                description: task.description,
                recurrence: task.recurrence,
                custom_days: task.custom_days,
                category: task.category,
                is_active: task.is_active,
                target_sets: task.target_sets,
                created_at: task.created_at,
                updated_at: task.updated_at,
            }
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

fn task_completion_is_complete(completed_sets: i32, target_sets: i32) -> bool {
    completed_sets >= target_sets
}

fn next_completed_sets(existing_sets: i32, target_sets: i32) -> i32 {
    let target_sets = target_sets.max(1);
    (existing_sets + 1).clamp(1, target_sets)
}

pub async fn get_completion_dates(
    state: &AppState,
    task_id: Uuid,
    user_id: Uuid,
) -> Result<Vec<NaiveDate>, AppError> {
    tasks::get_completion_dates(&state.pool, task_id, user_id).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    fn test_task(recurrence: TaskRecurrence, custom_days: Vec<i32>) -> Task {
        Task {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            title: "Test task".to_string(),
            description: None,
            recurrence,
            custom_days,
            category: TaskCategory::Workout,
            is_active: true,
            target_sets: 4,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[test]
    fn task_completion_requires_target_sets() {
        assert!(!task_completion_is_complete(0, 4));
        assert!(!task_completion_is_complete(1, 4));
        assert!(!task_completion_is_complete(3, 4));
    }

    #[test]
    fn task_completion_is_complete_at_or_above_target_sets() {
        assert!(task_completion_is_complete(4, 4));
        assert!(task_completion_is_complete(5, 4));
    }

    #[test]
    fn next_completed_sets_caps_at_target_without_resetting() {
        assert_eq!(next_completed_sets(0, 4), 1);
        assert_eq!(next_completed_sets(3, 4), 4);
        assert_eq!(next_completed_sets(4, 4), 4);
        assert_eq!(next_completed_sets(5, 4), 4);
    }

    #[test]
    fn custom_task_scheduling_uses_monday_zero_weekdays() {
        let task = test_task(TaskRecurrence::Custom, vec![0]);

        assert!(task_is_scheduled(&task, 0));
        assert!(!task_is_scheduled(&task, 1));
        assert!(!task_is_scheduled(&task, 6));
    }
}
