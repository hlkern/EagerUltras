-- PostgreSQL manual migration for wishlist feature
-- Run once on eager_ultras database.

BEGIN;

CREATE TABLE IF NOT EXISTS user_wishlist_stadiums (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stadium_id BIGINT NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_wishlist_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_wishlist_stadium
        FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_wishlist_user_id_stadium_id
        UNIQUE (user_id, stadium_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON user_wishlist_stadiums(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_stadium_id ON user_wishlist_stadiums(stadium_id);

COMMIT;

