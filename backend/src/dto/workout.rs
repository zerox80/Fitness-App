use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Debug)]
pub struct WorkoutDetailDto {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub intensity: String,
    pub category: String,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub exercise_count: i64,
}

#[derive(Serialize, Debug)]
pub struct WorkoutListDto {
    pub id: Uuid,
    pub title: String,
    pub category: String,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize, Debug)]
pub struct WorkoutFilterParams {
    pub category: Option<String>,
    pub completed: Option<bool>,
    #[serde(default = "default_page")]
    pub page: i64,
    #[serde(default = "default_per_page")]
    pub per_page: i64,
}

fn default_page() -> i64 {
    1
}

fn default_per_page() -> i64 {
    20
}

impl WorkoutFilterParams {
    pub fn offset(&self) -> i64 {
        (self.page.max(1) - 1) * self.per_page.max(1).min(100)
    }

    pub fn limit(&self) -> i64 {
        self.per_page.max(1).min(100)
    }
}
