use axum::{
    extract::{ConnectInfo, Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use crate::state::AppState;

#[derive(Clone, Default)]
pub struct RateLimiter {
    requests: Arc<Mutex<HashMap<String, Vec<Instant>>>>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_allowed(&self, key: &str, max_requests: usize, window: Duration) -> bool {
        let mut requests = self.requests.lock().unwrap();
        let now = Instant::now();
        let window_start = now - window;

        let entries = requests.entry(key.to_string()).or_default();
        entries.retain(|&t| t > window_start);

        if entries.len() >= max_requests {
            return false;
        }

        entries.push(now);
        true
    }
}

pub async fn rate_limit_middleware(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = req
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| addr.ip().to_string());

    if !state.rate_limiter.is_allowed(&key, 100, Duration::from_secs(60)) {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    Ok(next.run(req).await)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::time::Duration;

    #[test]
    fn test_rate_limiter_allows_first_request() {
        let limiter = RateLimiter::new();
        assert!(limiter.is_allowed("user1", 3, Duration::from_secs(60)));
    }

    #[test]
    fn test_rate_limiter_allows_up_to_max() {
        let limiter = RateLimiter::new();
        for _ in 0..5 {
            assert!(limiter.is_allowed("user2", 5, Duration::from_secs(60)));
        }
    }

    #[test]
    fn test_rate_limiter_blocks_over_max() {
        let limiter = RateLimiter::new();
        for _ in 0..3 {
            assert!(limiter.is_allowed("user3", 3, Duration::from_secs(60)));
        }
        assert!(!limiter.is_allowed("user3", 3, Duration::from_secs(60)));
    }

    #[test]
    fn test_rate_limiter_different_keys_independent() {
        let limiter = RateLimiter::new();
        for _ in 0..3 {
            limiter.is_allowed("key_a", 3, Duration::from_secs(60));
        }
        assert!(!limiter.is_allowed("key_a", 3, Duration::from_secs(60)));
        assert!(limiter.is_allowed("key_b", 3, Duration::from_secs(60)));
    }

    #[test]
    fn test_rate_limiter_window_expiry() {
        let limiter = RateLimiter::new();
        for _ in 0..3 {
            limiter.is_allowed("user4", 3, Duration::from_millis(50));
        }
        assert!(!limiter.is_allowed("user4", 3, Duration::from_millis(50)));
        thread::sleep(Duration::from_millis(60));
        assert!(limiter.is_allowed("user4", 3, Duration::from_millis(50)));
    }

    #[test]
    fn test_rate_limiter_max_1() {
        let limiter = RateLimiter::new();
        assert!(limiter.is_allowed("user5", 1, Duration::from_secs(60)));
        assert!(!limiter.is_allowed("user5", 1, Duration::from_secs(60)));
    }

    #[test]
    fn test_rate_limiter_default_constructs() {
        let limiter = RateLimiter::default();
        assert!(limiter.is_allowed("test", 10, Duration::from_secs(60)));
    }
}
