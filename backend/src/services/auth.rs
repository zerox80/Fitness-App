use argon2::{password_hash::PasswordVerifier, Argon2};

use crate::{
    error::{is_unique_violation, AppError},
    models::{AuthResponse, LoginRequest, RegisterRequest},
    repository::users,
    state::AppState,
    utils::jwt::generate_token,
    utils::password::{dummy_hash, hash_password, parse_password_hash},
    validators::user::{normalize_email, validate_email, validate_name, validate_password},
};

// Keep in sync with SESSION_MAX_AGE_SECONDS in utils/session_cookie.rs.
const TOKEN_LIFETIME_HOURS: i64 = 72;

pub async fn register(state: &AppState, req: RegisterRequest) -> Result<AuthResponse, AppError> {
    let email = normalize_email(&req.email);
    validate_email(&email)?;
    validate_name(&req.name)?;
    validate_password(&req.password)?;

    let existing = users::find_by_email(&state.pool, &email).await?;
    if existing.is_some() {
        return Err(AppError::Validation("Email already in use".to_string()));
    }

    let password_hash = hash_password(&req.password)?;

    // The find_by_email check above is racy: a concurrent registration can
    // insert the same email first, in which case the unique index fires.
    let user = match users::create(&state.pool, &email, &req.name, &password_hash).await {
        Err(AppError::Database(db_error)) if is_unique_violation(&db_error) => {
            return Err(AppError::Validation("Email already in use".to_string()));
        }
        other => other?,
    };

    let token = generate_token(&user.id, &state.config.jwt_secret, TOKEN_LIFETIME_HOURS)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}

pub async fn login(state: &AppState, req: LoginRequest) -> Result<AuthResponse, AppError> {
    let email = normalize_email(&req.email);
    let user = users::find_by_email(&state.pool, &email).await?;

    // Always verify against some hash so unknown emails take the same time
    // as wrong passwords (no user enumeration via timing).
    let parsed_hash = user
        .as_ref()
        .and_then(|u| parse_password_hash(&u.password_hash));
    let hash_ref = match &parsed_hash {
        Some(hash) => hash,
        None => dummy_hash(),
    };

    Argon2::default()
        .verify_password(req.password.as_bytes(), hash_ref)
        .map_err(|_| AppError::Auth("Invalid credentials".to_string()))?;

    let user = user.ok_or_else(|| AppError::Auth("Invalid credentials".to_string()))?;

    let token = generate_token(&user.id, &state.config.jwt_secret, TOKEN_LIFETIME_HOURS)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}
