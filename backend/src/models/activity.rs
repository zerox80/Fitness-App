use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct UserStats {
    pub total_workouts: i64,
    pub total_minutes: i64,
    pub current_streak: i64,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct ActivityLog {
    pub id: Uuid,
    pub user_id: Uuid,
    pub activity_date: NaiveDate,
    pub steps: i32,
    pub calories: i32,
    pub active_minutes: i32,
    pub move_progress: f64,
    pub exercise_progress: f64,
    pub stand_progress: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateActivityRequest {
    pub steps: i32,
    pub calories: i32,
    pub active_minutes: i32,
    pub move_progress: f64,
    pub exercise_progress: f64,
    pub stand_progress: f64,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct DailyActivity {
    pub steps: i32,
    pub calories: i32,
    pub active_minutes: i32,
    pub move_progress: f64,
    pub exercise_progress: f64,
    pub stand_progress: f64,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct WeeklyActivitySummary {
    pub week_start: NaiveDate,
    pub total_steps: i64,
    pub total_calories: i64,
    pub total_active_minutes: i64,
    pub workout_count: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_stats_serialize() {
        let stats = UserStats {
            total_workouts: 42,
            total_minutes: 1260,
            current_streak: 5,
        };
        let json = serde_json::to_string(&stats).unwrap();
        assert!(json.contains("42"));
        assert!(json.contains("1260"));
        assert!(json.contains("5"));
    }

    #[test]
    fn test_user_stats_deserialize() {
        let json = r#"{"total_workouts":10,"total_minutes":300,"current_streak":3}"#;
        let stats: UserStats = serde_json::from_str(json).unwrap();
        assert_eq!(stats.total_workouts, 10);
        assert_eq!(stats.total_minutes, 300);
        assert_eq!(stats.current_streak, 3);
    }

    #[test]
    fn test_update_activity_request_deserialize() {
        let json = r#"{
            "steps": 8000,
            "calories": 500,
            "active_minutes": 45,
            "move_progress": 0.75,
            "exercise_progress": 0.5,
            "stand_progress": 0.8
        }"#;
        let req: UpdateActivityRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.steps, 8000);
        assert_eq!(req.calories, 500);
        assert!((req.move_progress - 0.75).abs() < f64::EPSILON);
    }

    #[test]
    fn test_daily_activity_deserialize() {
        let json = r#"{
            "steps": 5000,
            "calories": 300,
            "active_minutes": 30,
            "move_progress": 0.6,
            "exercise_progress": 0.4,
            "stand_progress": 0.7
        }"#;
        let activity: DailyActivity = serde_json::from_str(json).unwrap();
        assert_eq!(activity.steps, 5000);
        assert_eq!(activity.active_minutes, 30);
    }

    #[test]
    fn test_daily_activity_zero_values() {
        let json = r#"{
            "steps": 0,
            "calories": 0,
            "active_minutes": 0,
            "move_progress": 0.0,
            "exercise_progress": 0.0,
            "stand_progress": 0.0
        }"#;
        let activity: DailyActivity = serde_json::from_str(json).unwrap();
        assert_eq!(activity.steps, 0);
        assert!((activity.move_progress).abs() < f64::EPSILON);
    }

    #[test]
    fn test_weekly_activity_summary_serialize() {
        let summary = WeeklyActivitySummary {
            week_start: NaiveDate::from_ymd_opt(2026, 4, 20).unwrap(),
            total_steps: 50000,
            total_calories: 3500,
            total_active_minutes: 300,
            workout_count: 5,
        };
        let json = serde_json::to_string(&summary).unwrap();
        assert!(json.contains("50000"));
        assert!(json.contains("2026-04-20"));
    }
}
