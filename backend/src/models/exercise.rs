use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, PartialEq, sqlx::Type)]
#[sqlx(type_name = "muscle_group", rename_all = "snake_case")]
pub enum MuscleGroup {
    Chest,
    Back,
    Shoulders,
    Biceps,
    Triceps,
    Abs,
    Legs,
    Glutes,
    Calves,
    Forearms,
    Traps,
    Lats,
    Hamstrings,
    Quadriceps,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, sqlx::Type)]
#[sqlx(type_name = "equipment_type", rename_all = "snake_case")]
pub enum EquipmentType {
    Barbell,
    Dumbbell,
    Kettlebell,
    Machine,
    Cable,
    Bodyweight,
    ResistanceBand,
    MedicineBall,
    Bench,
    SquatRack,
    PullUpBar,
    DipStation,
    Treadmill,
    None,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, sqlx::Type)]
#[sqlx(type_name = "difficulty_level", rename_all = "snake_case")]
pub enum DifficultyLevel {
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Serialize, Deserialize, Debug, sqlx::FromRow)]
pub struct Exercise {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub muscle_groups: Vec<MuscleGroup>,
    pub equipment: Vec<EquipmentType>,
    pub difficulty: DifficultyLevel,
    pub instructions: Option<Vec<String>>,
    pub image_url: Option<String>,
    pub video_url: Option<String>,
    pub is_custom: bool,
    pub user_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateExerciseRequest {
    pub name: String,
    pub description: Option<String>,
    pub muscle_groups: Vec<MuscleGroup>,
    pub equipment: Vec<EquipmentType>,
    pub difficulty: DifficultyLevel,
    pub instructions: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateExerciseRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub muscle_groups: Option<Vec<MuscleGroup>>,
    pub equipment: Option<Vec<EquipmentType>>,
    pub difficulty: Option<DifficultyLevel>,
    pub instructions: Option<Vec<String>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_muscle_group_serialization() {
        let json = serde_json::to_string(&MuscleGroup::Chest).unwrap();
        assert_eq!(json, "\"Chest\"");
    }

    #[test]
    fn test_muscle_group_deserialization() {
        let mg: MuscleGroup = serde_json::from_str("\"Back\"").unwrap();
        assert!(matches!(mg, MuscleGroup::Back));
    }

    #[test]
    fn test_equipment_type_serialization() {
        let json = serde_json::to_string(&EquipmentType::Barbell).unwrap();
        assert_eq!(json, "\"Barbell\"");
    }

    #[test]
    fn test_equipment_type_all_variants() {
        let variants = [
            ("\"Barbell\"", EquipmentType::Barbell),
            ("\"Dumbbell\"", EquipmentType::Dumbbell),
            ("\"Kettlebell\"", EquipmentType::Kettlebell),
            ("\"Machine\"", EquipmentType::Machine),
            ("\"Cable\"", EquipmentType::Cable),
            ("\"Bodyweight\"", EquipmentType::Bodyweight),
            ("\"ResistanceBand\"", EquipmentType::ResistanceBand),
            ("\"MedicineBall\"", EquipmentType::MedicineBall),
            ("\"Bench\"", EquipmentType::Bench),
            ("\"SquatRack\"", EquipmentType::SquatRack),
            ("\"PullUpBar\"", EquipmentType::PullUpBar),
            ("\"DipStation\"", EquipmentType::DipStation),
            ("\"Treadmill\"", EquipmentType::Treadmill),
            ("\"None\"", EquipmentType::None),
        ];
        for (json_str, expected) in &variants {
            let et: EquipmentType = serde_json::from_str(json_str).unwrap();
            assert!(std::mem::discriminant(&et) == std::mem::discriminant(expected));
        }
    }

    #[test]
    fn test_difficulty_level_serialization() {
        assert_eq!(
            serde_json::to_string(&DifficultyLevel::Beginner).unwrap(),
            "\"Beginner\""
        );
        assert_eq!(
            serde_json::to_string(&DifficultyLevel::Intermediate).unwrap(),
            "\"Intermediate\""
        );
        assert_eq!(
            serde_json::to_string(&DifficultyLevel::Advanced).unwrap(),
            "\"Advanced\""
        );
    }

    #[test]
    fn test_difficulty_level_deserialization() {
        let dl: DifficultyLevel = serde_json::from_str("\"Advanced\"").unwrap();
        assert!(matches!(dl, DifficultyLevel::Advanced));
    }

    #[test]
    fn test_create_exercise_request_deserialize() {
        let json = r#"{
            "name": "Bench Press",
            "description": "Classic chest exercise",
            "muscle_groups": ["Chest", "Triceps"],
            "equipment": ["Barbell"],
            "difficulty": "Intermediate",
            "instructions": ["Lie down", "Lift"]
        }"#;
        let req: CreateExerciseRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Bench Press");
        assert_eq!(req.muscle_groups.len(), 2);
        assert!(req.instructions.is_some());
    }

    #[test]
    fn test_update_exercise_request_partial() {
        let json = r#"{"name": "Updated Exercise"}"#;
        let req: UpdateExerciseRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, Some("Updated Exercise".to_string()));
        assert_eq!(req.description, None);
        assert_eq!(req.muscle_groups, None);
    }

    #[test]
    fn test_muscle_group_all_variants() {
        let variants = [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Abs",
            "Legs",
            "Glutes",
            "Calves",
            "Forearms",
            "Traps",
            "Lats",
            "Hamstrings",
            "Quadriceps",
        ];
        for v in &variants {
            let json_str = format!("\"{}\"", v);
            let mg: MuscleGroup = serde_json::from_str(&json_str).unwrap();
            let serialized = serde_json::to_string(&mg).unwrap();
            assert_eq!(serialized, json_str);
        }
    }

    #[test]
    fn test_invalid_muscle_group() {
        let result = serde_json::from_str::<MuscleGroup>("\"invalid\"");
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_equipment_type() {
        let result = serde_json::from_str::<EquipmentType>("\"spaceship\"");
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_difficulty_level() {
        let result = serde_json::from_str::<DifficultyLevel>("\"expert\"");
        assert!(result.is_err());
    }
}
