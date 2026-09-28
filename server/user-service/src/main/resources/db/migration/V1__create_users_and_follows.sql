CREATE TABLE users (
    id              UUID PRIMARY KEY,
    username        VARCHAR(30) NOT NULL UNIQUE,
    display_name    VARCHAR(60) NOT NULL,
    password_hash   TEXT NOT NULL,
    bio             VARCHAR(280),
    avatar_gradient VARCHAR(60) NOT NULL DEFAULT 'from-violet to-pink',
    grade_label     VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE follows (
    id            UUID PRIMARY KEY,
    follower_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL,
    UNIQUE (follower_id, followee_id)
);

CREATE INDEX idx_follows_followee ON follows(followee_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);