CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    direct_key VARCHAR(73) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED',
    requested_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_conversation_status
        CHECK (status IN ('REQUEST', 'ACCEPTED', 'REJECTED', 'BLOCKED'))
);

CREATE INDEX idx_conversations_updated_at
    ON conversations(updated_at DESC);

CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_read_at TIMESTAMPTZ,

    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_user
    ON conversation_members(user_id);

CREATE INDEX idx_conversation_members_user_read
    ON conversation_members(user_id, last_read_at);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    client_message_id UUID,
    message_type VARCHAR(20) NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_message_type
        CHECK (message_type IN ('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE')),

    CONSTRAINT chk_message_content
        CHECK (
            (message_type = 'TEXT' AND content IS NOT NULL AND length(trim(content)) > 0)
            OR
            (message_type <> 'TEXT')
        )
);

CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_messages_sender
    ON messages(sender_id);

CREATE UNIQUE INDEX uq_messages_sender_client_id
    ON messages(sender_id, client_message_id)
    WHERE client_message_id IS NOT NULL;

CREATE INDEX idx_conversations_requested_by
    ON conversations(requested_by)
    WHERE requested_by IS NOT NULL;
