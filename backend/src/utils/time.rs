use chrono::{DateTime, Datelike, Duration, NaiveDate, Utc};

pub fn week_start(date: NaiveDate) -> NaiveDate {
    let days_from_monday = date.weekday().num_days_from_monday();
    date - Duration::days(days_from_monday as i64)
}

pub fn week_end(date: NaiveDate) -> NaiveDate {
    week_start(date) + Duration::days(6)
}

pub fn month_start(date: NaiveDate) -> NaiveDate {
    NaiveDate::from_ymd_opt(date.year(), date.month(), 1).unwrap_or(date)
}

pub fn month_end(date: NaiveDate) -> NaiveDate {
    let next_month = if date.month() == 12 {
        NaiveDate::from_ymd_opt(date.year() + 1, 1, 1)
    } else {
        NaiveDate::from_ymd_opt(date.year(), date.month() + 1, 1)
    };
    next_month.unwrap_or(date) - Duration::days(1)
}

pub fn days_between(start: NaiveDate, end: NaiveDate) -> i64 {
    (end - start).num_days()
}

pub fn is_same_day(a: DateTime<Utc>, b: DateTime<Utc>) -> bool {
    a.date_naive() == b.date_naive()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;

    #[test]
    fn test_week_start_monday() {
        let monday = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        assert_eq!(week_start(monday), monday);
    }

    #[test]
    fn test_week_start_wednesday() {
        let wednesday = NaiveDate::from_ymd_opt(2026, 4, 22).unwrap();
        let monday = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        assert_eq!(week_start(wednesday), monday);
    }

    #[test]
    fn test_week_start_sunday() {
        let sunday = NaiveDate::from_ymd_opt(2026, 4, 26).unwrap();
        let monday = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        assert_eq!(week_start(sunday), monday);
    }

    #[test]
    fn test_week_end() {
        let monday = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        let sunday = NaiveDate::from_ymd_opt(2026, 4, 26).unwrap();
        assert_eq!(week_end(monday), sunday);
    }

    #[test]
    fn test_week_end_from_mid_week() {
        let thursday = NaiveDate::from_ymd_opt(2026, 4, 23).unwrap();
        let sunday = NaiveDate::from_ymd_opt(2026, 4, 26).unwrap();
        assert_eq!(week_end(thursday), sunday);
    }

    #[test]
    fn test_month_start() {
        let date = NaiveDate::from_ymd_opt(2026, 4, 15).unwrap();
        let start = NaiveDate::from_ymd_opt(2026, 4, 1).unwrap();
        assert_eq!(month_start(date), start);
    }

    #[test]
    fn test_month_start_first_day() {
        let first = NaiveDate::from_ymd_opt(2026, 4, 1).unwrap();
        assert_eq!(month_start(first), first);
    }

    #[test]
    fn test_month_end_april() {
        let date = NaiveDate::from_ymd_opt(2026, 4, 15).unwrap();
        let end = NaiveDate::from_ymd_opt(2026, 4, 30).unwrap();
        assert_eq!(month_end(date), end);
    }

    #[test]
    fn test_month_end_december() {
        let date = NaiveDate::from_ymd_opt(2026, 12, 5).unwrap();
        let end = NaiveDate::from_ymd_opt(2026, 12, 31).unwrap();
        assert_eq!(month_end(date), end);
    }

    #[test]
    fn test_month_end_february_leap() {
        let date = NaiveDate::from_ymd_opt(2024, 2, 10).unwrap();
        let end = NaiveDate::from_ymd_opt(2024, 2, 29).unwrap();
        assert_eq!(month_end(date), end);
    }

    #[test]
    fn test_month_end_february_non_leap() {
        let date = NaiveDate::from_ymd_opt(2025, 2, 10).unwrap();
        let end = NaiveDate::from_ymd_opt(2025, 2, 28).unwrap();
        assert_eq!(month_end(date), end);
    }

    #[test]
    fn test_days_between_same_day() {
        let date = NaiveDate::from_ymd_opt(2026, 4, 23).unwrap();
        assert_eq!(days_between(date, date), 0);
    }

    #[test]
    fn test_days_between_one_week() {
        let start = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        let end = NaiveDate::from_ymd_opt(2026, 4, 27).unwrap();
        assert_eq!(days_between(start, end), 7);
    }

    #[test]
    fn test_days_between_reverse() {
        let start = NaiveDate::from_ymd_opt(2026, 4, 27).unwrap();
        let end = NaiveDate::from_ymd_opt(2026, 4, 20).unwrap();
        assert_eq!(days_between(start, end), -7);
    }

    #[test]
    fn test_is_same_day_true() {
        let a = Utc::now();
        let b = a + chrono::Duration::hours(5);
        assert!(is_same_day(a, b));
    }

    #[test]
    fn test_is_same_day_false() {
        let a = Utc::now();
        let b = a + chrono::Duration::days(1);
        assert!(!is_same_day(a, b));
    }

    #[test]
    fn test_week_start_end_consistency() {
        let date = NaiveDate::from_ymd_opt(2026, 4, 23).unwrap();
        let start = week_start(date);
        let end = week_end(date);
        assert_eq!(days_between(start, end), 6);
    }

    #[test]
    fn test_month_start_end_consistency() {
        let date = NaiveDate::from_ymd_opt(2026, 1, 15).unwrap();
        let start = month_start(date);
        let end = month_end(date);
        assert!(start <= date);
        assert!(end >= date);
        assert!(start <= end);
    }
}
