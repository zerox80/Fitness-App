use crate::config::Config;
use crate::dto::{
    CalorieChatRequest, CalorieChatResponse, GenerateWorkoutRequest, GeneratedWorkout,
};
use anyhow::{Context, Result};
use reqwest::Client;
use serde_json::json;
use std::time::Duration;
use tracing;

const AI_CLIENT_TIMEOUT: Duration = Duration::from_secs(30);

pub struct AiService {
    client: Client,
    api_key: String,
    api_base: String,
    model: String,
}

impl AiService {
    pub fn new(config: &Config) -> Result<Self> {
        let api_key = config
            .ai_api_key
            .clone()
            .context("MOONSHOT_API_KEY not configured")?;
        Ok(Self {
            client: Client::builder()
                .timeout(AI_CLIENT_TIMEOUT)
                .build()
                .context("Failed to build AI HTTP client")?,
            api_key,
            api_base: config.ai_api_base.clone(),
            model: config.ai_model.clone(),
        })
    }

    pub async fn generate_workout(&self, req: &GenerateWorkoutRequest) -> Result<GeneratedWorkout> {
        let system_prompt = "Du bist ein professioneller Fitness-Coach. Erstelle ein strukturiertes Training basierend auf den Vorgaben des Nutzers. Antworte AUSSCHLIESSLICH im JSON-Format.";
        let user_prompt = format!(
            "Erstelle ein Training: Dauer {} Minuten, Fokus: {}, Intensität: {}. 
            Das JSON-Format muss so aussehen: 
            {{
                \"title\": \"Name des Trainings\",
                \"description\": \"Kurze Beschreibung\",
                \"total_duration\": {},
                \"intensity\": \"{}\",
                \"exercises\": [
                    {{ \"name\": \"Übung 1\", \"sets\": 3, \"reps\": \"12\", \"rest_seconds\": 60 }},
                    ...
                ]
            }}",
            req.duration_minutes, req.focus, req.intensity, req.duration_minutes, req.intensity
        );

        let http_response = self
            .client
            .post(format!("{}/chat/completions", self.api_base))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&json!({
                "model": self.model,
                "messages": [
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": user_prompt }
                ],
                "response_format": { "type": "json_object" },
                "thinking": { "type": "disabled" }
            }))
            .send()
            .await
            .context("Failed to send request to AI API")?;

        let status = http_response.status();
        if !status.is_success() {
            let error_body = http_response.text().await.unwrap_or_default();
            tracing::error!(
                status = %status,
                model = %self.model,
                error_body = %error_body,
                "AI API returned non-2xx status"
            );
            return Err(anyhow::anyhow!(
                "AI API returned {} for model {}: {}",
                status,
                self.model,
                error_body
            ));
        }

        let response = http_response
            .json::<serde_json::Value>()
            .await
            .context("Failed to parse AI API response as JSON")?;

        let choices = response["choices"]
            .as_array()
            .context("AI response missing 'choices' array")?;

        let first_choice = choices
            .first()
            .context("AI response 'choices' array was empty")?;

        let content = first_choice["message"]["content"]
            .as_str()
            .context("Failed to get content string from AI response message")?;

        let generated: GeneratedWorkout = serde_json::from_str(content).with_context(|| {
            format!(
                "Failed to parse AI response into GeneratedWorkout. Content: {}",
                content
            )
        })?;

        Ok(generated)
    }

    pub async fn estimate_activity_calories(
        &self,
        req: &CalorieChatRequest,
    ) -> Result<CalorieChatResponse> {
        let system_prompt = r#"Du bist ein praeziser Fitness-Assistent fuer verbrannte Aktivitaetskalorien.
Schaetze ausschliesslich aktive Kalorien aus Bewegung, Training, Sport, Arbeit oder Alltagsaktivitaeten. Zaehle keine gegessenen Kalorien und keinen Grundumsatz.
Wenn Aktivitaet, Dauer oder Intensitaet fehlen, stelle genau eine kurze Rueckfrage.
Wenn genug Informationen vorhanden sind, schaetze total_calories und active_minutes fuer den angegebenen Tag.
Antworte ausschliesslich als gueltiges JSON-Objekt in diesem Format:
{
  "status": "needs_more_info" | "estimated",
  "reply": "kurze Antwort auf Deutsch",
  "estimate": null | {
    "total_calories": 0,
    "active_minutes": 0,
    "confidence": 0.0,
    "activities": [
      {
        "name": "Aktivitaet",
        "duration_minutes": 0,
        "intensity": "niedrig|mittel|hoch|unbekannt",
        "calories": 0
      }
    ]
  }
}"#;

        let mut messages = vec![json!({ "role": "system", "content": system_prompt })];

        if let Some(date) = req.date {
            messages.push(json!({
                "role": "system",
                "content": format!("Der relevante Aktivitaetstag ist {}.", date)
            }));
        }

        messages.extend(req.messages.iter().map(|message| {
            json!({
                "role": message.role.as_api_role(),
                "content": message.content.trim()
            })
        }));

        let http_response = self
            .client
            .post(format!("{}/chat/completions", self.api_base))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&json!({
                "model": self.model,
                "messages": messages,
                "response_format": { "type": "json_object" },
                "thinking": { "type": "disabled" },
                "max_completion_tokens": 900
            }))
            .send()
            .await
            .context("Failed to send request to AI API")?;

        let status = http_response.status();
        if !status.is_success() {
            let error_body = http_response.text().await.unwrap_or_default();
            tracing::error!(
                status = %status,
                model = %self.model,
                error_body = %error_body,
                "AI API returned non-2xx status for calorie chat"
            );
            return Err(anyhow::anyhow!(
                "AI API returned {} for model {}: {}",
                status,
                self.model,
                error_body
            ));
        }

        let response = http_response
            .json::<serde_json::Value>()
            .await
            .context("Failed to parse AI API response as JSON")?;

        let content = extract_ai_message_content(&response)?;
        parse_calorie_chat_content(content)
    }
}

fn extract_ai_message_content(response: &serde_json::Value) -> Result<&str> {
    let choices = response["choices"]
        .as_array()
        .context("AI response missing 'choices' array")?;

    let first_choice = choices
        .first()
        .context("AI response 'choices' array was empty")?;

    first_choice["message"]["content"]
        .as_str()
        .context("Failed to get content string from AI response message")
}

pub(crate) fn parse_calorie_chat_content(content: &str) -> Result<CalorieChatResponse> {
    let normalized = strip_json_code_fence(content);
    let response: CalorieChatResponse = serde_json::from_str(normalized).with_context(|| {
        format!(
            "Failed to parse AI response into CalorieChatResponse. Content: {}",
            content
        )
    })?;

    response
        .validate()
        .map_err(anyhow::Error::msg)
        .context("AI calorie response failed validation")?;

    Ok(response)
}

fn strip_json_code_fence(content: &str) -> &str {
    let trimmed = content.trim();
    let Some(without_prefix) = trimmed.strip_prefix("```") else {
        return trimmed;
    };

    let without_language = without_prefix
        .strip_prefix("json")
        .unwrap_or(without_prefix)
        .trim_start();

    without_language
        .strip_suffix("```")
        .map(str::trim)
        .unwrap_or(trimmed)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dto::CalorieChatStatus;

    #[test]
    fn parses_needs_more_info_response() {
        let response = parse_calorie_chat_content(
            r#"{"status":"needs_more_info","reply":"Wie lange bist du gelaufen?","estimate":null}"#,
        )
        .unwrap();

        assert_eq!(response.status, CalorieChatStatus::NeedsMoreInfo);
        assert!(response.estimate.is_none());
    }

    #[test]
    fn parses_estimated_response() {
        let response = parse_calorie_chat_content(
            r#"{
                "status": "estimated",
                "reply": "Das waren etwa 420 kcal.",
                "estimate": {
                    "total_calories": 420,
                    "active_minutes": 45,
                    "confidence": 0.82,
                    "activities": [
                        {
                            "name": "Joggen",
                            "duration_minutes": 45,
                            "intensity": "mittel",
                            "calories": 420
                        }
                    ]
                }
            }"#,
        )
        .unwrap();

        assert_eq!(response.status, CalorieChatStatus::Estimated);
        let estimate = response.estimate.unwrap();
        assert_eq!(estimate.total_calories, 420);
        assert_eq!(estimate.active_minutes, 45);
    }

    #[test]
    fn parses_json_code_fenced_response() {
        let response = parse_calorie_chat_content(
            r#"```json
{"status":"needs_more_info","reply":"Wie intensiv war es?","estimate":null}
```"#,
        )
        .unwrap();

        assert_eq!(response.status, CalorieChatStatus::NeedsMoreInfo);
    }

    #[test]
    fn rejects_estimated_response_without_estimate() {
        let err = parse_calorie_chat_content(
            r#"{"status":"estimated","reply":"Fertig.","estimate":null}"#,
        )
        .unwrap_err();

        assert!(err.to_string().contains("failed validation"));
    }
}
