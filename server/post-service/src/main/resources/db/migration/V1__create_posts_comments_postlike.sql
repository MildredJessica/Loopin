CREATE TABLE posts (
    id               UUID PRIMARY KEY,
    author_id        UUID NOT NULL,
    author_username  VARCHAR(30) NOT NULL,
    author_gradient  VARCHAR(60) NOT NULL,
    body             VARCHAR(2000) NOT NULL,
    tag              VARCHAR(60),
    media_label      VARCHAR(120),
    media_gradient   VARCHAR(60),
    like_count       BIGINT NOT NULL DEFAULT 0,
    comment_count    BIGINT NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE post_likes (
    id          UUID PRIMARY KEY,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_id)
);

CREATE TABLE comments (
    id               UUID PRIMARY KEY,
    post_id          UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id        UUID NOT NULL,
    author_username  VARCHAR(30) NOT NULL,
    author_gradient  VARCHAR(60) NOT NULL,
    text             VARCHAR(500) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_comments_post ON comments(post_id);
