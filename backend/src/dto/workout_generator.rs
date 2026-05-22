use serde::{Deserialize, Deserializer, Serialize};

const MAX_WORKOUT_DURATION_MINUTES: i32 = 240;
const MAX_FOCUS_CHARS: usize = 100;
const MAX_GENERATED_DESCRIPTION_CHARS: usize = 1_000;
const MAX_GENERATED_EXERCISES: usize = 100;
const MAX_GENERATED_REPS_CHARS: usize = 50;

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
        if self.duration_minutes > MAX_WORKOUT_DURATION_MINUTES {
            return Err(format!(
                "duration_minutes must be at most {}",
                MAX_WORKOUT_DURATION_MINUTES
            ));
        }
        if self.focus.trim().is_empty() {
            return Err("focus must not be empty".to_string());
        }
        if self.focus.trim().chars().count() > MAX_FOCUS_CHARS {
            return Err(format!(
                "focus must contain at most {} characters",
                MAX_FOCUS_CHARS
            ));
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

impl GeneratedWorkout {
    pub fn validate(&self) -> Result<(), String> {
        if self.title.trim().is_empty() {
            return Err("title must not be empty".to_string());
        }
        if self.title.trim().chars().count() > 200 {
            return Err("title must contain at most 200 characters".to_string());
        }
        if self.description.trim().chars().count() > MAX_GENERATED_DESCRIPTION_CHARS {
            return Err(format!(
                "description must contain at most {} characters",
                MAX_GENERATED_DESCRIPTION_CHARS
            ));
        }
        if self.total_duration < 1 || self.total_duration > MAX_WORKOUT_DURATION_MINUTES {
            return Err(format!(
                "total_duration must be between 1 and {}",
                MAX_WORKOUT_DURATION_MINUTES
            ));
        }
        match self.intensity.to_ascii_lowercase().as_str() {
            "low" | "medium" | "high" => {}
            _ => return Err("intensity must be one of low, medium, high".to_string()),
        }
        if self.exercises.is_empty() {
            return Err("exercises must not be empty".to_string());
        }
        if self.exercises.len() > MAX_GENERATED_EXERCISES {
            return Err(format!(
                "exercises must include at most {} items",
                MAX_GENERATED_EXERCISES
            ));
        }

        for (index, exercise) in self.exercises.iter().enumerate() {
            exercise.validate(index)?;
        }

        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedExercise {
    pub name: String,
    pub sets: i32,
    #[serde(deserialize_with = "deserialize_flexible_reps")]
    pub reps: String,
    pub rest_seconds: i32,
}

impl GeneratedExercise {
    fn validate(&self, index: usize) -> Result<(), String> {
        if self.name.trim().is_empty() {
            return Err(format!("exercises[{}].name must not be empty", index));
        }
        if self.name.trim().chars().count() > 200 {
            return Err(format!(
                "exercises[{}].name must contain at most 200 characters",
                index
            ));
        }
        if !(1..=50).contains(&self.sets) {
            return Err(format!(
                "exercises[{}].sets must be between 1 and 50",
                index
            ));
        }
        if self.reps.trim().is_empty() {
            return Err(format!("exercises[{}].reps must not be empty", index));
        }
        if self.reps.trim().chars().count() > MAX_GENERATED_REPS_CHARS {
            return Err(format!(
                "exercises[{}].reps must contain at most {} characters",
                index, MAX_GENERATED_REPS_CHARS
            ));
        }
        if !(0..=3600).contains(&self.rest_seconds) {
            return Err(format!(
                "exercises[{}].rest_seconds must be between 0 and 3600",
                index
            ));
        }
        Ok(())
    }
}

fn deserialize_flexible_reps<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
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

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_generated_workout() -> GeneratedWorkout {
        GeneratedWorkout {
            title: "Full Body".to_string(),
            description: "Training".to_string(),
            exercises: vec![GeneratedExercise {
                name: "Squat".to_string(),
                sets: 3,
                reps: "10".to_string(),
                rest_seconds: 60,
            }],
            total_duration: 30,
            intensity: "Medium".to_string(),
        }
    }

    #[test]
    fn rejects_generation_request_over_max_duration() {
        let req = GenerateWorkoutRequest {
            duration_minutes: MAX_WORKOUT_DURATION_MINUTES + 1,
            focus: "Full Body".to_string(),
            intensity: "Medium".to_string(),
        };

        assert!(req.validate().unwrap_err().contains("at most"));
    }

    #[test]
    fn rejects_generation_request_over_max_focus_length() {
        let req = GenerateWorkoutRequest {
            duration_minutes: 30,
            focus: "x".repeat(MAX_FOCUS_CHARS + 1),
            intensity: "Medium".to_string(),
        };

        assert!(req.validate().unwrap_err().contains("focus"));
    }

    #[test]
    fn validates_generated_workout() {
        assert!(valid_generated_workout().validate().is_ok());
    }

    #[test]
    fn rejects_generated_workout_without_exercises() {
        let mut workout = valid_generated_workout();
        workout.exercises = vec![];

        assert!(workout.validate().unwrap_err().contains("exercises"));
    }

    #[test]
    fn rejects_generated_workout_with_invalid_exercise() {
        let mut workout = valid_generated_workout();
        workout.exercises[0].sets = 0;

        assert!(workout.validate().unwrap_err().contains("sets"));
    }
}
