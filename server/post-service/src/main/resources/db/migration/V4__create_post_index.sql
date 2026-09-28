CREATE INDEX IF NOT EXISTS idx_posts_created_at
ON posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_user
ON post_likes (post_id, user_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_user_post
ON post_likes (user_id, post_id);