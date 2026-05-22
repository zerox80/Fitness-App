DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM users
        GROUP BY lower(email)
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Cannot create case-insensitive email uniqueness: duplicate emails differ only by case';
    END IF;
END $$;

UPDATE users
SET email = lower(email)
WHERE email <> lower(email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique
ON users (lower(email));
