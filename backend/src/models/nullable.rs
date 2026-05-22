use serde::{Deserialize, Deserializer};

pub fn deserialize_nullable_update<'de, D, T>(
    deserializer: D,
) -> Result<Option<Option<T>>, D::Error>
where
    D: Deserializer<'de>,
    T: Deserialize<'de>,
{
    Option::<T>::deserialize(deserializer).map(Some)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;

    #[derive(Debug, Deserialize, PartialEq)]
    struct Patch {
        #[serde(default, deserialize_with = "deserialize_nullable_update")]
        description: Option<Option<String>>,
    }

    #[test]
    fn missing_field_is_no_update() {
        let patch: Patch = serde_json::from_str("{}").unwrap();
        assert_eq!(patch.description, None);
    }

    #[test]
    fn null_field_is_clear_update() {
        let patch: Patch = serde_json::from_str(r#"{"description": null}"#).unwrap();
        assert_eq!(patch.description, Some(None));
    }

    #[test]
    fn value_field_is_set_update() {
        let patch: Patch = serde_json::from_str(r#"{"description": "next"}"#).unwrap();
        assert_eq!(patch.description, Some(Some("next".to_string())));
    }
}
