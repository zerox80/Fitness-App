use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use std::sync::OnceLock;

use crate::{
    error::AppError,
    middleware::auth::Claims,
    models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse},
    repository::users,
    state::AppState,
    validators::user::{validate_email, validate_name, validate_password},
};

pub async fn register(state: &AppState, req: RegisterRequest) -> Result<AuthResponse, AppError> {
    validate_email(&req.email)?;
    validate_name(&req.name)?;
    validate_password(&req.password)?;

    let existing = users::find_by_email(&state.pool, &req.email).await?;
    if existing.is_some() {
        return Err(AppError::Validation("Email already in use".to_string()));
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(req.password.as_bytes(), &salt)
        .map_err(|_| AppError::Internal)?
        .to_string();

    let user = users::create(&state.pool, &req.email, &req.name, &password_hash).await?;

    let token = generate_token(&user.id, &state.config.jwt_secret)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}

pub async fn login(state: &AppState, req: LoginRequest) -> Result<AuthResponse, AppError> {
    let user = users::find_by_email(&state.pool, &req.email).await?;

    let parsed_hash = match &user {
        Some(u) => PasswordHash::new(&u.password_hash).ok(),
        None => None,
    };

    static DUMMY_HASH: OnceLock<PasswordHash<'static>> = OnceLock::new();

    let hash_ref = match &parsed_hash {
        Some(h) => h,
        None => DUMMY_HASH.get_or_init(|| {
            PasswordHash::new(
                "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            )
            .expect("Valid dummy hash")
        }),
    };

    Argon2::default()
        .verify_password(req.password.as_bytes(), hash_ref)
        .map_err(|_| AppError::Auth("Invalid credentials".to_string()))?;

    let user = user.ok_or_else(|| AppError::Auth("Invalid credentials".to_string()))?;

    let token = generate_token(&user.id, &state.config.jwt_secret)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}

fn generate_token(user_id: &uuid::Uuid, secret: &str) -> Result<String, AppError> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: (now + chrono::Duration::hours(72)).timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::Internal)
}
