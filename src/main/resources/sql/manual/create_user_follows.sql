-- PostgreSQL manual migration for follow feature
-- Run once on eager_ultras database.

BEGIN;

CREATE TABLE IF NOT EXISTS user_follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_follows_following
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_follows_pair
        UNIQUE (follower_id, following_id),
    CONSTRAINT chk_user_follows_not_self
        CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

COMMIT;

