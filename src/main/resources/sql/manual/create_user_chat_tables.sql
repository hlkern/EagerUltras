-- PostgreSQL manual migration for chat feature
-- Run once on eager_ultras database.

BEGIN;

CREATE TABLE IF NOT EXISTS user_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_a_id BIGINT NOT NULL,
    user_b_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_conversations_user_a
        FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_conversations_user_b
        FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_conversations_pair
        UNIQUE (user_a_id, user_b_id),
    CONSTRAINT chk_user_conversations_not_self
        CHECK (user_a_id <> user_b_id),
    CONSTRAINT chk_user_conversations_order
        CHECK (user_a_id < user_b_id)
);

CREATE TABLE IF NOT EXISTS user_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES user_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_conversations_user_a_id ON user_conversations(user_a_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_user_b_id ON user_conversations(user_b_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_updated_at ON user_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_messages_conversation_id ON user_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at DESC);

CREATE OR REPLACE FUNCTION set_user_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_conversations_updated_at ON user_conversations;
CREATE TRIGGER trg_user_conversations_updated_at
BEFORE UPDATE ON user_conversations
FOR EACH ROW
EXECUTE FUNCTION set_user_conversations_updated_at();

COMMIT;

