ALTER TABLE users
    RENAME COLUMN display_name TO name;

ALTER TABLE users
    RENAME COLUMN password_hash TO password;

ALTER TABLE users
    ALTER COLUMN name TYPE VARCHAR(190);

ALTER TABLE users
    ALTER COLUMN bio SET NOT NULL;

