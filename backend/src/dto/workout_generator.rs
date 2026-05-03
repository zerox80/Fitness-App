use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Deserialize)]
pub struct GenerateWorkoutRequest {
    pub duration_minutes: i32,
    pub focus: String,
    pub intensity: String,
}

impl GenerateWorkoutRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.duration_minutes < 1 {
            return Err("duration_minutes must be at least 1".to_string());
        }
        if self.focus.trim().is_empty() {
            return Err("focus must not be empty".to_string());
        }
        match self.intensity.as_str() {
            "Low" | "Medium" | "High" => Ok(()),
            other => Err(format!(
                "intensity must be one of 'Low', 'Medium', 'High', got '{}'",
                other
            )),
        }
    }
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
    #[serde(deserialize_with = "deserialize_flexible_reps")]
    pub reps: String,
    pub rest_seconds: i32,
}

fn deserialize_flexible_reps<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    use serde::de;

    #[derive(Deserialize)]
    #[serde(untagged)]
    enum StringOrInt {
        String(String),
        Int(i64),
    }

    match StringOrInt::deserialize(deserializer)? {
        StringOrInt::String(s) => Ok(s),
        StringOrInt::Int(n) => Ok(n.to_string()),
    }
}
