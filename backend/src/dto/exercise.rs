use serde::Deserialize;

use crate::models::{DifficultyLevel, EquipmentType, MuscleGroup};

#[derive(Deserialize, Debug)]
pub struct ExerciseFilterParams {
    pub muscle_group: Option<MuscleGroup>,
    pub equipment: Option<EquipmentType>,
    pub difficulty: Option<DifficultyLevel>,
    pub search: Option<String>,
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

impl ExerciseFilterParams {
    pub fn offset(&self) -> i64 {
        (self.page.max(1) - 1) * self.per_page.clamp(1, 100)
    }

    pub fn limit(&self) -> i64 {
        self.per_page.clamp(1, 100)
    }
}
