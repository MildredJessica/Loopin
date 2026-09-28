CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
ON notifications (recipient_username, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
ON notifications (recipient_username, created_at DESC);