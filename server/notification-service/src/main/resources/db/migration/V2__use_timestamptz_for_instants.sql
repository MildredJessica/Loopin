-- Existing notification timestamps are interpreted as UTC.
ALTER TABLE notifications
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC';
