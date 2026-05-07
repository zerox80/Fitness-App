use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

const MAX_MESSAGES: usize = 20;
const MAX_MESSAGE_CHARS: usize = 2_000;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CalorieChatRole {
    User,
    Assistant,
}

impl CalorieChatRole {
    pub fn as_api_role(&self) -> &'static str {
        match self {
            Self::User => "user",
            Self::Assistant => "assistant",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalorieChatMessage {
    pub role: CalorieChatRole,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CalorieChatRequest {
    pub date: Option<NaiveDate>,
    pub messages: Vec<CalorieChatMessage>,
}

impl CalorieChatRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.messages.is_empty() {
            return Err("messages must not be empty".to_string());
        }

        if self.messages.len() > MAX_MESSAGES {
            return Err(format!("messages must contain at most {}", MAX_MESSAGES));
        }

        for (index, message) in self.messages.iter().enumerate() {
            let content = message.content.trim();
            if content.is_empty() {
                return Err(format!("messages[{}].content must not be empty", index));
            }

            if content.chars().count() > MAX_MESSAGE_CHARS {
                return Err(format!(
                    "messages[{}].content must contain at most {} characters",
                    index, MAX_MESSAGE_CHARS
                ));
            }
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum CalorieChatStatus {
    NeedsMoreInfo,
    Estimated,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CalorieEstimateActivity {
    pub name: String,
    pub duration_minutes: i32,
    pub intensity: String,
    pub calories: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CalorieEstimate {
    pub total_calories: i32,
    pub active_minutes: i32,
    pub confidence: f64,
    pub activities: Vec<CalorieEstimateActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CalorieChatResponse {
    pub status: CalorieChatStatus,
    pub reply: String,
    pub estimate: Option<CalorieEstimate>,
}

impl CalorieChatResponse {
    pub fn validate(&self) -> Result<(), String> {
        if self.reply.trim().is_empty() {
            return Err("reply must not be empty".to_string());
        }

        match (&self.status, &self.estimate) {
            (CalorieChatStatus::Estimated, Some(estimate)) => estimate.validate(),
            (CalorieChatStatus::Estimated, None) => {
                Err("estimated responses must include estimate".to_string())
            }
            (CalorieChatStatus::NeedsMoreInfo, _) => Ok(()),
        }
    }
}

impl CalorieEstimate {
    fn validate(&self) -> Result<(), String> {
        if self.total_calories < 0 {
            return Err("estimate.total_calories must not be negative".to_string());
        }

        if self.active_minutes < 0 {
            return Err("estimate.active_minutes must not be negative".to_string());
        }

        if !(0.0..=1.0).contains(&self.confidence) {
            return Err("estimate.confidence must be between 0 and 1".to_string());
        }

        for (index, activity) in self.activities.iter().enumerate() {
            if activity.name.trim().is_empty() {
                return Err(format!(
                    "estimate.activities[{}].name must not be empty",
                    index
                ));
            }

            if activity.duration_minutes < 0 {
                return Err(format!(
                    "estimate.activities[{}].duration_minutes must not be negative",
                    index
                ));
            }

            if activity.calories < 0 {
                return Err(format!(
                    "estimate.activities[{}].calories must not be negative",
                    index
                ));
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn user_message(content: &str) -> CalorieChatMessage {
        CalorieChatMessage {
            role: CalorieChatRole::User,
            content: content.to_string(),
        }
    }

    #[test]
    fn validates_request_with_user_message() {
        let req = CalorieChatRequest {
            date: None,
            messages: vec![user_message("45 Minuten Joggen")],
        };

        assert!(req.validate().is_ok());
    }

    #[test]
    fn rejects_empty_messages() {
        let req = CalorieChatRequest {
            date: None,
            messages: vec![],
        };

        assert_eq!(req.validate().unwrap_err(), "messages must not be empty");
    }

    #[test]
    fn rejects_blank_message_content() {
        let req = CalorieChatRequest {
            date: None,
            messages: vec![user_message("   ")],
        };

        assert!(req
            .validate()
            .unwrap_err()
            .contains("messages[0].content must not be empty"));
    }

    #[test]
    fn rejects_too_long_message_content() {
        let req = CalorieChatRequest {
            date: None,
            messages: vec![user_message(&"x".repeat(MAX_MESSAGE_CHARS + 1))],
        };

        assert!(req.validate().unwrap_err().contains("at most 2000"));
    }

    #[test]
    fn validates_estimated_response() {
        let response = CalorieChatResponse {
            status: CalorieChatStatus::Estimated,
            reply: "Das waren etwa 420 kcal.".to_string(),
            estimate: Some(CalorieEstimate {
                total_calories: 420,
                active_minutes: 45,
                confidence: 0.78,
                activities: vec![CalorieEstimateActivity {
                    name: "Joggen".to_string(),
                    duration_minutes: 45,
                    intensity: "mittel".to_string(),
                    calories: 420,
                }],
            }),
        };

        assert!(response.validate().is_ok());
    }

    #[test]
    fn rejects_estimated_response_without_estimate() {
        let response = CalorieChatResponse {
            status: CalorieChatStatus::Estimated,
            reply: "Fertig.".to_string(),
            estimate: None,
        };

        assert_eq!(
            response.validate().unwrap_err(),
            "estimated responses must include estimate"
        );
    }
}
