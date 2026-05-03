use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, sqlx::Type, PartialEq, Clone)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "task_recurrence", rename_all = "lowercase")]
pub enum TaskRecurrence {
    Daily,
    Weekdays,
    Weekly,
    Custom,
}

#[derive(Serialize, Deserialize, Debug, sqlx::Type, PartialEq, Clone)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "task_category", rename_all = "lowercase")]
pub enum TaskCategory {
    Workout,
    Nutrition,
    Habit,
    General,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Task {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub recurrence: TaskRecurrence,
    pub custom_days: Vec<i32>,
    pub category: TaskCategory,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct TaskCompletion {
    pub id: Uuid,
    pub task_id: Uuid,
    pub user_id: Uuid,
    pub completed_date: chrono::NaiveDate,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: Option<String>,
    pub recurrence: TaskRecurrence,
    pub custom_days: Option<Vec<i32>>,
    pub category: TaskCategory,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub recurrence: Option<TaskRecurrence>,
    pub custom_days: Option<Vec<i32>>,
    pub category: Option<TaskCategory>,
    pub is_active: Option<bool>,
}

#[derive(Serialize, Debug, sqlx::FromRow)]
pub struct TaskWithCompletionStatus {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub recurrence: TaskRecurrence,
    pub custom_days: Vec<i32>,
    pub category: TaskCategory,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_today: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_task_request_deserialize() {
        let json = r#"{
            "title": "30 Minuten joggen",
            "description": "Cardio training",
            "recurrence": "daily",
            "category": "workout"
        }"#;
        let req: CreateTaskRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, "30 Minuten joggen");
        assert_eq!(req.recurrence, TaskRecurrence::Daily);
        assert_eq!(req.category, TaskCategory::Workout);
        assert_eq!(req.custom_days, None);
    }

    #[test]
    fn test_create_task_request_with_custom_days() {
        let json = r#"{
            "title": "Yoga",
            "recurrence": "custom",
            "custom_days": [1, 3, 5],
            "category": "habit"
        }"#;
        let req: CreateTaskRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.custom_days, Some(vec![1, 3, 5]));
    }

    #[test]
    fn test_update_task_request_partial() {
        let json = r#"{"title": "Neuer Titel"}"#;
        let req: UpdateTaskRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, Some("Neuer Titel".to_string()));
        assert_eq!(req.recurrence, None);
        assert_eq!(req.is_active, None);
    }

    #[test]
    fn test_update_task_request_empty() {
        let json = r#"{}"#;
        let req: UpdateTaskRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, None);
        assert_eq!(req.description, None);
    }

    #[test]
    fn test_task_recurrence_serialize() {
        assert_eq!(
            serde_json::to_string(&TaskRecurrence::Daily).unwrap(),
            "\"daily\""
        );
        assert_eq!(
            serde_json::to_string(&TaskRecurrence::Weekdays).unwrap(),
            "\"weekdays\""
        );
        assert_eq!(
            serde_json::to_string(&TaskRecurrence::Weekly).unwrap(),
            "\"weekly\""
        );
        assert_eq!(
            serde_json::to_string(&TaskRecurrence::Custom).unwrap(),
            "\"custom\""
        );
    }

    #[test]
    fn test_task_category_serialize() {
        assert_eq!(
            serde_json::to_string(&TaskCategory::Workout).unwrap(),
            "\"workout\""
        );
        assert_eq!(
            serde_json::to_string(&TaskCategory::Nutrition).unwrap(),
            "\"nutrition\""
        );
        assert_eq!(
            serde_json::to_string(&TaskCategory::Habit).unwrap(),
            "\"habit\""
        );
        assert_eq!(
            serde_json::to_string(&TaskCategory::General).unwrap(),
            "\"general\""
        );
    }
}
