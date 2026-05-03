use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Workout {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub intensity: String,
    pub category: String,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateWorkoutRequest {
    pub title: String,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub intensity: String,
    pub category: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateWorkoutRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: Option<i32>,
    pub intensity: Option<String>,
    pub category: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct WorkoutSummary {
    pub id: Uuid,
    pub title: String,
    pub category: String,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_workout_request_deserialize() {
        let json = r#"{
            "title": "Push Day",
            "description": "Chest & Shoulders",
            "duration_minutes": 60,
            "intensity": "high",
            "category": "strength"
        }"#;
        let req: CreateWorkoutRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, "Push Day");
        assert_eq!(req.duration_minutes, 60);
        assert_eq!(req.intensity, "high");
    }

    #[test]
    fn test_create_workout_request_no_description() {
        let json = r#"{
            "title": "Quick HIIT",
            "duration_minutes": 20,
            "intensity": "high",
            "category": "cardio"
        }"#;
        let req: CreateWorkoutRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.description, None);
    }

    #[test]
    fn test_update_workout_request_partial() {
        let json = r#"{"title": "Updated Title"}"#;
        let req: UpdateWorkoutRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, Some("Updated Title".to_string()));
        assert_eq!(req.description, None);
        assert_eq!(req.duration_minutes, None);
        assert_eq!(req.intensity, None);
        assert_eq!(req.category, None);
    }

    #[test]
    fn test_update_workout_request_empty() {
        let json = r#"{}"#;
        let req: UpdateWorkoutRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.title, None);
        assert_eq!(req.description, None);
    }

    #[test]
    fn test_workout_serialize() {
        let workout = Workout {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            title: "Test Workout".to_string(),
            description: Some("A description".to_string()),
            duration_minutes: 45,
            intensity: "medium".to_string(),
            category: "strength".to_string(),
            completed_at: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_string(&workout).unwrap();
        assert!(json.contains("Test Workout"));
        assert!(json.contains("medium"));
    }

    #[test]
    fn test_workout_summary_serialize() {
        let summary = WorkoutSummary {
            id: Uuid::new_v4(),
            title: "Summary".to_string(),
            category: "cardio".to_string(),
            completed_at: Some(Utc::now()),
            created_at: Utc::now(),
        };
        let json = serde_json::to_string(&summary).unwrap();
        assert!(json.contains("cardio"));
    }
}
