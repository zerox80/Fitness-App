use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct PaginationParams {
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

impl PaginationParams {
    pub fn offset(&self) -> i64 {
        (self.page.max(1) - 1) * self.per_page.max(1).min(100)
    }

    pub fn limit(&self) -> i64 {
        self.per_page.max(1).min(100)
    }
}

#[derive(Serialize, Debug)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub page: i64,
    pub per_page: i64,
    pub total: i64,
    pub total_pages: i64,
}

impl<T> PaginatedResponse<T> {
    pub fn new(data: Vec<T>, page: i64, per_page: i64, total: i64) -> Self {
        let total_pages = if total == 0 {
            1
        } else {
            (total + per_page - 1) / per_page
        };
        Self {
            data,
            page,
            per_page,
            total,
            total_pages,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pagination_params_defaults() {
        let json = r#"{}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page, 1);
        assert_eq!(params.per_page, 20);
    }

    #[test]
    fn test_pagination_params_custom() {
        let json = r#"{"page": 3, "per_page": 50}"#;
        let params: PaginationParams = serde_json::from_str(json).unwrap();
        assert_eq!(params.page, 3);
        assert_eq!(params.per_page, 50);
    }

    #[test]
    fn test_offset_first_page() {
        let params = PaginationParams {
            page: 1,
            per_page: 20,
        };
        assert_eq!(params.offset(), 0);
    }

    #[test]
    fn test_offset_second_page() {
        let params = PaginationParams {
            page: 2,
            per_page: 20,
        };
        assert_eq!(params.offset(), 20);
    }

    #[test]
    fn test_offset_page_zero_clamps_to_page_1() {
        let params = PaginationParams {
            page: 0,
            per_page: 20,
        };
        assert_eq!(params.offset(), 0);
    }

    #[test]
    fn test_offset_negative_page_clamps() {
        let params = PaginationParams {
            page: -5,
            per_page: 10,
        };
        assert_eq!(params.offset(), 0);
    }

    #[test]
    fn test_limit_normal() {
        let params = PaginationParams {
            page: 1,
            per_page: 20,
        };
        assert_eq!(params.limit(), 20);
    }

    #[test]
    fn test_limit_clamps_to_100() {
        let params = PaginationParams {
            page: 1,
            per_page: 500,
        };
        assert_eq!(params.limit(), 100);
    }

    #[test]
    fn test_limit_clamps_zero_to_1() {
        let params = PaginationParams {
            page: 1,
            per_page: 0,
        };
        assert_eq!(params.limit(), 1);
    }

    #[test]
    fn test_limit_negative_clamps_to_1() {
        let params = PaginationParams {
            page: 1,
            per_page: -10,
        };
        assert_eq!(params.limit(), 1);
    }

    #[test]
    fn test_paginated_response_total_pages() {
        let resp = PaginatedResponse::new(vec![1, 2, 3], 1, 10, 25);
        assert_eq!(resp.total_pages, 3);
    }

    #[test]
    fn test_paginated_response_zero_total() {
        let resp: PaginatedResponse<i32> = PaginatedResponse::new(vec![], 1, 10, 0);
        assert_eq!(resp.total_pages, 1);
    }

    #[test]
    fn test_paginated_response_exact_division() {
        let resp = PaginatedResponse::new(vec![1, 2, 3, 4, 5], 1, 5, 10);
        assert_eq!(resp.total_pages, 2);
    }

    #[test]
    fn test_paginated_response_single_page() {
        let resp = PaginatedResponse::new(vec![1], 1, 20, 1);
        assert_eq!(resp.total_pages, 1);
    }

    #[test]
    fn test_paginated_response_large_total() {
        let resp: PaginatedResponse<i32> = PaginatedResponse::new(vec![], 1, 20, 1000);
        assert_eq!(resp.total_pages, 50);
    }

    #[test]
    fn test_paginated_response_fields() {
        let data = vec!["a", "b"];
        let resp = PaginatedResponse::new(data.clone(), 2, 10, 50);
        assert_eq!(resp.data, data);
        assert_eq!(resp.page, 2);
        assert_eq!(resp.per_page, 10);
        assert_eq!(resp.total, 50);
    }
}
