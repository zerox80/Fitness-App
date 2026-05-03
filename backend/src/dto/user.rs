use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Debug)]
pub struct UserProfileDto {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub stats: Option<UserStatsDto>,
}

#[derive(Serialize, Debug)]
pub struct UserStatsDto {
    pub total_workouts: i64,
    pub total_minutes: i64,
    pub current_streak: i64,
}

#[derive(Deserialize, Debug)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}
