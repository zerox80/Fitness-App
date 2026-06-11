use serde::Deserialize;

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
        (self.page.max(1) - 1) * self.per_page.clamp(1, 100)
    }

    pub fn limit(&self) -> i64 {
        self.per_page.clamp(1, 100)
    }
}
