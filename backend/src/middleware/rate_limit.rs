use axum::{
    extract::{ConnectInfo, Request, State},
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use std::{
    collections::HashMap,
    net::{IpAddr, SocketAddr},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use crate::{config::Config, state::AppState};

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
    let key = client_ip_for_rate_limit(req.headers(), addr.ip(), &state.config).to_string();

    if !state.rate_limiter.is_allowed(&key, 100, Duration::from_secs(60)) {
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
            trust_proxy_headers,
            trusted_proxy_ips: vec![IpAddr::V4(Ipv4Addr::LOCALHOST)],
            ai_api_key: None,
            ai_api_base: "https://api.moonshot.ai/v1".to_string(),
            ai_model: "moonshot-v1-8k".to_string(),
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
}
