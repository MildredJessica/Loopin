CREATE INDEX IF NOT EXISTS idx_comments_post_created
ON comments (post_id, created_at ASC);