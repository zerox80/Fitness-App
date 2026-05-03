use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{DifficultyLevel, EquipmentType, Exercise, MuscleGroup},
};

pub async fn list_filtered(
    pool: &PgPool,
    muscle_group: Option<MuscleGroup>,
    equipment: Option<EquipmentType>,
    difficulty: Option<DifficultyLevel>,
    search: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Exercise>, AppError> {
    let exercises = sqlx::query_as::<_, Exercise>(
        r#"
        SELECT * FROM exercises
        WHERE ($1::muscle_group IS NULL OR $1 = ANY(muscle_groups))
          AND ($2::equipment_type IS NULL OR $2 = ANY(equipment))
          AND ($3::difficulty_level IS NULL OR difficulty = $3)
          AND ($4::text IS NULL OR name ILIKE '%' || $4 || '%')
        ORDER BY name ASC
        LIMIT $5 OFFSET $6
        "#,
    )
    .bind(muscle_group)
    .bind(equipment)
    .bind(difficulty)
    .bind(search)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(AppError::Database)?;

    Ok(exercises)
}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Exercise>, AppError> {
    sqlx::query_as::<_, Exercise>("SELECT * FROM exercises WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::Database)
}

#[allow(clippy::too_many_arguments)]
pub async fn create(
    pool: &PgPool,
    name: &str,
    description: Option<&str>,
    muscle_groups: &[MuscleGroup],
    equipment: &[EquipmentType],
    difficulty: DifficultyLevel,
    instructions: Option<Vec<String>>,
    user_id: Option<Uuid>,
) -> Result<Exercise, AppError> {
    sqlx::query_as::<_, Exercise>(
        r#"
        INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty, instructions, is_custom, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        "#,
    )
    .bind(name)
    .bind(description)
    .bind(muscle_groups)
    .bind(equipment)
    .bind(difficulty)
    .bind(instructions)
    .bind(user_id.is_some())
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(AppError::Database)
}

#[allow(clippy::too_many_arguments)]
pub async fn update(
    pool: &PgPool,
    id: Uuid,
    user_id: Uuid,
    name: Option<&str>,
    description: Option<&str>,
    muscle_groups: Option<&Vec<MuscleGroup>>,
    equipment: Option<&Vec<EquipmentType>>,
    difficulty: Option<DifficultyLevel>,
    instructions: Option<Vec<String>>,
) -> Result<Option<Exercise>, AppError> {
    sqlx::query_as::<_, Exercise>(
        r#"
        UPDATE exercises
        SET
            name = COALESCE($3, name),
            description = COALESCE($4, description),
            muscle_groups = COALESCE($5, muscle_groups),
            equipment = COALESCE($6, equipment),
            difficulty = COALESCE($7, difficulty),
            instructions = COALESCE($8, instructions),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(user_id)
    .bind(name)
    .bind(description)
    .bind(muscle_groups)
    .bind(equipment)
    .bind(difficulty)
    .bind(instructions)
    .fetch_optional(pool)
    .await
    .map_err(AppError::Database)
}

pub async fn delete(pool: &PgPool, id: Uuid, user_id: Uuid) -> Result<u64, AppError> {
    let result = sqlx::query("DELETE FROM exercises WHERE id = $1 AND user_id = $2 AND is_custom = true")
        .bind(id)
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(AppError::Database)?;

    Ok(result.rows_affected())
}
