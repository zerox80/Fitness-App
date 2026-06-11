use axum::http::{header, HeaderValue, Method};
use tower_http::cors::CorsLayer;

use crate::config::Config;

const ALLOWED_METHODS: [Method; 6] = [
    Method::GET,
    Method::POST,
    Method::PUT,
    Method::PATCH,
    Method::DELETE,
    Method::OPTIONS,
];

// tower-http panics ("Invalid CORS configuration") if allow_credentials(true)
// is combined with wildcard methods/headers/origins, so the explicit-origins
// branch must list everything explicitly.
pub fn build_cors_layer(config: &Config) -> CorsLayer {
    match config.allowed_cors_origins() {
        None => CorsLayer::permissive(),
        Some(origins) => {
            let origins = origins
                .into_iter()
                .map(|origin| origin.parse::<HeaderValue>().expect("Invalid CORS origin"))
                .collect::<Vec<_>>();
            CorsLayer::new()
                .allow_origin(origins)
                .allow_methods(ALLOWED_METHODS)
                .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
                .allow_credentials(true)
        }
    }
}

#[cfg(test)]
mod tests {
    use axum::{
        body::Body,
        http::{header, Request, StatusCode},
        routing::get,
        Router,
    };
    use tower::ServiceExt;

    use super::*;

    fn test_config(cors_origin: &str) -> Config {
        Config {
            database_url: "postgres://localhost/test".to_string(),
            app_port: 3000,
            jwt_secret: "test-secret".to_string(),
            cors_origin: cors_origin.to_string(),
            session_cookie_name: "fitpulse_session".to_string(),
            cookie_secure: false,
            trust_proxy_headers: false,
            trusted_proxy_ips: vec![],
            ai_api_key: None,
            ai_api_base: "https://api.moonshot.ai/v1".to_string(),
            ai_model: "kimi-k2.6".to_string(),
        }
    }

    fn app(cors_origin: &str) -> Router {
        // Applying the layer is what triggers tower-http's
        // ensure_usable_cors_rules panic on invalid configurations.
        Router::new()
            .route("/", get(|| async { "ok" }))
            .layer(build_cors_layer(&test_config(cors_origin)))
    }

    #[tokio::test]
    async fn explicit_origins_with_credentials_do_not_panic() {
        let app = app("https://app.example.com,https://admin.example.com");

        let response = app
            .oneshot(
                Request::builder()
                    .method("OPTIONS")
                    .uri("/")
                    .header(header::ORIGIN, "https://app.example.com")
                    .header(header::ACCESS_CONTROL_REQUEST_METHOD, "POST")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        let headers = response.headers();
        assert_eq!(
            headers.get(header::ACCESS_CONTROL_ALLOW_ORIGIN).unwrap(),
            "https://app.example.com"
        );
        assert_eq!(
            headers
                .get(header::ACCESS_CONTROL_ALLOW_CREDENTIALS)
                .unwrap(),
            "true"
        );
        let allow_headers = headers
            .get(header::ACCESS_CONTROL_ALLOW_HEADERS)
            .unwrap()
            .to_str()
            .unwrap()
            .to_ascii_lowercase();
        assert!(allow_headers.contains("content-type"));
        assert!(allow_headers.contains("authorization"));
    }

    #[tokio::test]
    async fn disallowed_origin_gets_no_allow_origin_header() {
        let app = app("https://app.example.com");

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .header(header::ORIGIN, "https://evil.example.com")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert!(response
            .headers()
            .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
            .is_none());
    }

    #[tokio::test]
    async fn wildcard_config_uses_permissive_layer() {
        let app = app("*");

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/")
                    .header(header::ORIGIN, "https://anywhere.example.com")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(
            response
                .headers()
                .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
                .unwrap(),
            "*"
        );
    }
}
