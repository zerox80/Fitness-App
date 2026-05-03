use axum::{extract::Request, middleware::Next, response::Response};

pub async fn validate_json_middleware(req: Request, next: Next) -> Response {
    // Placeholder for JSON validation middleware.
    // In a full implementation, this could validate content-type,
    // max body size, or run schema validation.
    next.run(req).await
}
