use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GenerateWorkoutRequest {
    pub duration_minutes: i32,
    pub focus: String, // e.g., "Full Body", "Upper Body", "Core"
    pub intensity: String, // e.g., "Low", "Medium", "High"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedWorkout {
    pub title: String,
    pub description: String,
    pub exercises: Vec<GeneratedExercise>,
    pub total_duration: i32,
    pub intensity: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedExercise {
    pub name: String,
    pub sets: i32,
    pub reps: String, // e.g., "12", "30s"
    pub rest_seconds: i32,
}
