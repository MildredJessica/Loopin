CREATE TABLE notifications (
    id                  UUID PRIMARY KEY,
    recipient_username  VARCHAR(30) NOT NULL,
    actor_username      VARCHAR(30) NOT NULL,
    actor_gradient      VARCHAR(60) NOT NULL,
    type                VARCHAR(20) NOT NULL,
    message             VARCHAR(280) NOT NULL,
    read                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_username, created_at DESC);
