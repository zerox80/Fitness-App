use anyhow::{Context, Result};
use reqwest::Client;
use serde_json::json;
use tracing;
use crate::config::Config;
use crate::dto::workout_generator::{GenerateWorkoutRequest, GeneratedWorkout};

pub struct AiService {
    client: Client,
    api_key: String,
    api_base: String,
    model: String,
}

impl AiService {
    pub fn new(config: &Config) -> Result<Self> {
        let api_key = config.ai_api_key.clone().context("AI_API_KEY not configured")?;
        Ok(Self {
            client: Client::new(),
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

        let http_response = self.client
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

        let generated: GeneratedWorkout = serde_json::from_str(content)
            .with_context(|| format!("Failed to parse AI response into GeneratedWorkout. Content: {}", content))?;

        Ok(generated)
    }
}
