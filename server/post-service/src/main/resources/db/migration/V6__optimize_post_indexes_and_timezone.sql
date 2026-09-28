-- Convert existing timestamp columns to timestamptz.
-- Existing values are interpreted as UTC.

ALTER TABLE posts
    ALTER COLUMN created_at
    TYPE TIMESTAMP WITH TIME ZONE
    USING created_at AT TIME ZONE 'UTC';

ALTER TABLE post_likes
    ALTER COLUMN created_at
    TYPE TIMESTAMP WITH TIME ZONE
    USING created_at AT TIME ZONE 'UTC';

ALTER TABLE comments
    ALTER COLUMN created_at
    TYPE TIMESTAMP WITH TIME ZONE
    USING created_at AT TIME ZONE 'UTC';


-- Replace the old single-column indexes with indexes
-- that match the application's actual queries.

DROP INDEX IF EXISTS idx_post_likes_post;

DROP INDEX IF EXISTS idx_comments_post;
