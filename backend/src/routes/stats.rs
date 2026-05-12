use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::{NaiveDate, Utc};
use serde::Deserialize;
use std::{future::Future, time::Duration};
use uuid::Uuid;

use crate::{
    dto::{CalorieChatRequest, CalorieChatResponse},
    error::AppError,
    middleware::auth::AuthUser,
    models::{
        ActivityEntriesResponse, ActivityEntry, CreateActivityEntriesRequest, DailyActivity,
        UpdateActivityRequest, UserStats, WeeklyActivitySummary,
    },
    services::{ai::AiService, stats},
    state::AppState,
};

const CALORIE_CHAT_RATE_LIMIT: usize = 10;
const CALORIE_CHAT_RATE_WINDOW: Duration = Duration::from_secs(600);
const CALORIE_CHAT_RATE_LIMIT_MESSAGE: &str =
    "Zu viele Kalorien-Chat-Anfragen. Bitte versuche es später erneut.";
const CALORIE_CHAT_UNAVAILABLE_MESSAGE: &str = "Kalorienschätzung ist gerade nicht verfügbar.";

#[derive(Debug, Deserialize)]
pub struct ActivityDateParams {
    date: Option<NaiveDate>,
}

fn requested_activity_date(params: &ActivityDateParams) -> NaiveDate {
    params.date.unwrap_or_else(|| Utc::now().date_naive())
}

async fn activity_after_upsert<U, G, UFut, GFut>(
    upsert: U,
    get_activity: G,
) -> Result<DailyActivity, AppError>
where
    U: FnOnce() -> UFut,
    G: FnOnce() -> GFut,
    UFut: Future<Output = Result<(), AppError>>,
    GFut: Future<Output = Result<DailyActivity, AppError>>,
{
    upsert().await?;
    get_activity().await
}

pub async fn get_stats(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<UserStats>, AppError> {
    Ok(Json(
        stats::get_user_stats(&state, auth_user.user_id).await?,
    ))
}

pub async fn get_weekly(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
) -> Result<Json<WeeklyActivitySummary>, AppError> {
    Ok(Json(
        stats::get_weekly_summary(&state, auth_user.user_id).await?,
    ))
}

pub async fn get_today_activity(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Query(params): Query<ActivityDateParams>,
) -> Result<Json<DailyActivity>, AppError> {
    Ok(Json(
        stats::get_activity_for_date(&state, auth_user.user_id, requested_activity_date(&params))
            .await?,
    ))
}

pub async fn update_activity(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Query(params): Query<ActivityDateParams>,
    Json(req): Json<UpdateActivityRequest>,
) -> Result<Json<DailyActivity>, AppError> {
    let activity_date = requested_activity_date(&params);

    let activity = activity_after_upsert(
        || {
            crate::repository::activity::upsert_today(
                &state.pool,
                auth_user.user_id,
                activity_date,
                req.steps,
                req.calories,
                req.active_minutes,
                req.move_progress,
                req.exercise_progress,
                req.stand_progress,
            )
        },
        || stats::get_activity_for_date(&state, auth_user.user_id, activity_date),
    )
    .await?;

    Ok(Json(activity))
}

pub async fn list_activity_entries(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Query(params): Query<ActivityDateParams>,
) -> Result<Json<Vec<ActivityEntry>>, AppError> {
    Ok(Json(
        stats::get_activity_entries_for_date(
            &state,
            auth_user.user_id,
            requested_activity_date(&params),
        )
        .await?,
    ))
}

pub async fn create_activity_entries(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<CreateActivityEntriesRequest>,
) -> Result<Json<ActivityEntriesResponse>, AppError> {
    Ok(Json(
        stats::create_activity_entries(&state, auth_user.user_id, req).await?,
    ))
}

pub async fn delete_activity_entry(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Path(entry_id): Path<Uuid>,
) -> Result<Json<ActivityEntriesResponse>, AppError> {
    Ok(Json(
        stats::delete_activity_entry(&state, auth_user.user_id, entry_id).await?,
    ))
}

pub async fn activity_calorie_chat(
    State(state): State<AppState>,
    axum::Extension(auth_user): axum::Extension<AuthUser>,
    Json(req): Json<CalorieChatRequest>,
) -> Result<Json<CalorieChatResponse>, AppError> {
    req.validate().map_err(AppError::Validation)?;

    let rate_limit_key = format!("activity-calorie-chat:{}", auth_user.user_id);
    if !state.rate_limiter.is_allowed(
        &rate_limit_key,
        CALORIE_CHAT_RATE_LIMIT,
        CALORIE_CHAT_RATE_WINDOW,
    ) {
        return Err(AppError::RateLimited(
            CALORIE_CHAT_RATE_LIMIT_MESSAGE.to_string(),
        ));
    }

    let ai_service = AiService::new(&state.config).map_err(calorie_chat_error)?;
    let response = ai_service
        .estimate_activity_calories(&req)
        .await
        .map_err(calorie_chat_error)?;

    Ok(Json(response))
}

fn calorie_chat_error(error: anyhow::Error) -> AppError {
    tracing::error!(%error, "activity calorie chat failed");
    AppError::Internal(CALORIE_CHAT_UNAVAILABLE_MESSAGE.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        extract::Request as AxumRequest,
        http::{Request, StatusCode},
        middleware::Next,
        response::Response,
        routing::post,
        Router,
    };
    use tower::ServiceExt;
    use uuid::Uuid;

    fn test_state() -> AppState {
        AppState {
            pool: sqlx::PgPool::connect_lazy("postgres://localhost/test").unwrap(),
            config: crate::config::Config {
                database_url: "postgres://localhost/test".to_string(),
                app_port: 3000,
                jwt_secret: "test-secret".to_string(),
                cors_origin: "*".to_string(),
                trust_proxy_headers: false,
                trusted_proxy_ips: vec![],
                ai_api_key: None,
                ai_api_base: "https://api.moonshot.ai/v1".to_string(),
                ai_model: "kimi-k2.6".to_string(),
            },
            rate_limiter: crate::middleware::rate_limit::RateLimiter::default(),
        }
    }

    async fn add_test_auth_user(mut req: AxumRequest, next: Next) -> Response {
        let user_id = req
            .headers()
            .get("x-user-id")
            .and_then(|value| value.to_str().ok())
            .and_then(|value| Uuid::parse_str(value).ok())
            .expect("x-user-id header must contain a UUID");

        req.extensions_mut().insert(AuthUser { user_id });
        next.run(req).await
    }

    fn test_app() -> Router {
        Router::new()
            .route("/api/activity/calorie-chat", post(activity_calorie_chat))
            .layer(axum::middleware::from_fn(add_test_auth_user))
            .with_state(test_state())
    }

    fn calorie_chat_body() -> String {
        serde_json::json!({
            "messages": [
                { "role": "user", "content": "45 Minuten Joggen" }
            ]
        })
        .to_string()
    }

    async fn post_calorie_chat(app: Router, user_id: Uuid) -> (StatusCode, serde_json::Value) {
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/activity/calorie-chat")
                    .header("content-type", "application/json")
                    .header("x-user-id", user_id.to_string())
                    .body(Body::from(calorie_chat_body()))
                    .unwrap(),
            )
            .await
            .unwrap();

        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let json = serde_json::from_slice(&body).unwrap();
        (status, json)
    }

    #[tokio::test]
    async fn calorie_chat_returns_generic_error_when_ai_is_not_configured() {
        let app = test_app();
        let user_id = Uuid::new_v4();

        let (status, json) = post_calorie_chat(app, user_id).await;

        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(json["error"], CALORIE_CHAT_UNAVAILABLE_MESSAGE);
        assert!(!json["error"].as_str().unwrap().contains("MOONSHOT_API_KEY"));
    }

    #[tokio::test]
    async fn update_activity_returns_full_activity_after_upsert() {
        let activity = activity_after_upsert(
            || async { Ok(()) },
            || async {
                Ok(DailyActivity {
                    steps: 8_500,
                    calories: 2_150,
                    active_minutes: 54,
                    move_progress: 0.82,
                    exercise_progress: 0.71,
                    stand_progress: 0.66,
                    base_calories: 2_000,
                    base_active_minutes: 45,
                    additional_calories: 150,
                    additional_active_minutes: 9,
                })
            },
        )
        .await
        .unwrap();

        assert_eq!(activity.steps, 8_500);
        assert_eq!(activity.base_calories, 2_000);
        assert_eq!(activity.additional_calories, 150);
        assert_eq!(activity.additional_active_minutes, 9);
    }

    #[tokio::test]
    async fn calorie_chat_rate_limits_the_eleventh_request_for_one_user() {
        let app = test_app();
        let user_id = Uuid::new_v4();

        for _ in 0..CALORIE_CHAT_RATE_LIMIT {
            let (status, _) = post_calorie_chat(app.clone(), user_id).await;
            assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        }

        let (status, json) = post_calorie_chat(app, user_id).await;

        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(json["error"], CALORIE_CHAT_RATE_LIMIT_MESSAGE);
    }

    #[tokio::test]
    async fn calorie_chat_rate_limit_is_user_specific() {
        let app = test_app();
        let exhausted_user_id = Uuid::new_v4();
        let other_user_id = Uuid::new_v4();

        for _ in 0..CALORIE_CHAT_RATE_LIMIT {
            let (status, _) = post_calorie_chat(app.clone(), exhausted_user_id).await;
            assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        }

        let (status, _) = post_calorie_chat(app.clone(), exhausted_user_id).await;
        assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);

        let (status, json) = post_calorie_chat(app, other_user_id).await;
        assert_eq!(status, StatusCode::INTERNAL_SERVER_ERROR);
        assert_eq!(json["error"], CALORIE_CHAT_UNAVAILABLE_MESSAGE);
    }
}
