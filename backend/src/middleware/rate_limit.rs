use axum::{
    extract::{ConnectInfo, Request, State},
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use dashmap::DashMap;
use std::{
    collections::VecDeque,
    net::{IpAddr, SocketAddr},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use crate::{config::Config, state::AppState};

const CLEANUP_INTERVAL: Duration = Duration::from_secs(30);

#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<DashMap<String, VecDeque<Instant>>>,
    last_cleanup: Arc<Mutex<Instant>>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn is_allowed(&self, key: &str, max_requests: usize, window: Duration) -> bool {
        let now = Instant::now();
        let window_start = now - window;

        self.cleanup_expired(now, window_start);

        let mut entries = self.requests.entry(key.to_string()).or_default();
        prune_bucket(&mut entries, window_start);
        if entries.len() >= max_requests {
            return false;
        }

        entries.push_back(now);
        true
    }

    fn cleanup_expired(&self, now: Instant, window_start: Instant) {
        let mut last_cleanup = self.last_cleanup.lock().unwrap();
        if now.duration_since(*last_cleanup) < CLEANUP_INTERVAL {
            return;
        }

        *last_cleanup = now;
        drop(last_cleanup);

        self.requests.retain(|_, entries| {
            prune_bucket(entries, window_start);
            !entries.is_empty()
        });
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        Self {
            requests: Arc::new(DashMap::new()),
            last_cleanup: Arc::new(Mutex::new(Instant::now())),
        }
    }
}

fn prune_bucket(entries: &mut VecDeque<Instant>, window_start: Instant) {
    while entries
        .front()
        .is_some_and(|timestamp| *timestamp <= window_start)
    {
        entries.pop_front();
    }
}

pub async fn rate_limit_middleware(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = client_ip_for_rate_limit(req.headers(), addr.ip(), &state.config).to_string();

    if !state
        .rate_limiter
        .is_allowed(&key, 100, Duration::from_secs(60))
    {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    Ok(next.run(req).await)
}

fn client_ip_for_rate_limit(headers: &HeaderMap, remote_ip: IpAddr, config: &Config) -> IpAddr {
    if config.trust_proxy_headers && config.trusted_proxy_ips.contains(&remote_ip) {
        forwarded_for_ip(headers).unwrap_or(remote_ip)
    } else {
        remote_ip
    }
}

fn forwarded_for_ip(headers: &HeaderMap) -> Option<IpAddr> {
    headers
        .get("x-forwarded-for")?
        .to_str()
        .ok()?
        .split(',')
        .next()?
        .trim()
        .parse()
        .ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderMap;
    use std::net::{IpAddr, Ipv4Addr};
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

    fn test_config(trust_proxy_headers: bool) -> Config {
        Config {
            database_url: "postgres://localhost/test".to_string(),
            app_port: 3000,
            jwt_secret: "test-secret".to_string(),
            cors_origin: "*".to_string(),
            session_cookie_name: "fitpulse_session".to_string(),
            cookie_secure: false,
            trust_proxy_headers,
            trusted_proxy_ips: vec![IpAddr::V4(Ipv4Addr::LOCALHOST)],
            ai_api_key: None,
            ai_api_base: "https://api.moonshot.ai/v1".to_string(),
            ai_model: "kimi-k2.6".to_string(),
        }
    }

    #[test]
    fn ignores_x_forwarded_for_when_proxy_headers_disabled() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "203.0.113.10".parse().unwrap());
        let remote_ip = IpAddr::V4(Ipv4Addr::LOCALHOST);

        let key = client_ip_for_rate_limit(&headers, remote_ip, &test_config(false));

        assert_eq!(key, remote_ip);
    }

    #[test]
    fn accepts_first_x_forwarded_for_from_trusted_proxy() {
        let mut headers = HeaderMap::new();
        headers.insert(
            "x-forwarded-for",
            "203.0.113.10, 198.51.100.5".parse().unwrap(),
        );

        let key = client_ip_for_rate_limit(
            &headers,
            IpAddr::V4(Ipv4Addr::LOCALHOST),
            &test_config(true),
        );

        assert_eq!(key, IpAddr::V4(Ipv4Addr::new(203, 0, 113, 10)));
    }

    #[test]
    fn malformed_x_forwarded_for_falls_back_to_remote_ip() {
        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", "not-an-ip".parse().unwrap());
        let remote_ip = IpAddr::V4(Ipv4Addr::LOCALHOST);

        let key = client_ip_for_rate_limit(&headers, remote_ip, &test_config(true));

        assert_eq!(key, remote_ip);
    }

    #[test]
    fn test_rate_limiter_memory_cleanup() {
        let limiter = RateLimiter::new();

        // Add a request for user_temp with a short window of 10ms
        limiter.is_allowed("user_temp", 1, Duration::from_millis(10));

        // Ensure it is in the map
        assert_eq!(limiter.requests.len(), 1);

        // Wait for it to expire
        thread::sleep(Duration::from_millis(15));
        *limiter.last_cleanup.lock().unwrap() = Instant::now() - CLEANUP_INTERVAL;

        // Make another request for a different user, which should trigger cleanup
        limiter.is_allowed("user_active", 1, Duration::from_millis(10));

        // The expired user_temp should have been removed, leaving only user_active
        assert_eq!(limiter.requests.len(), 1);
        assert!(!limiter.requests.contains_key("user_temp"));
        assert!(limiter.requests.contains_key("user_active"));
    }
}
