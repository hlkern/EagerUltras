CREATE TABLE IF NOT EXISTS user_match_comment_reactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_match_id BIGINT NOT NULL,
    reaction_type VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_umcr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_umcr_user_match FOREIGN KEY (user_match_id) REFERENCES user_matches (id) ON DELETE CASCADE,
    CONSTRAINT ck_umcr_reaction_type CHECK (reaction_type IN ('LIKE', 'DISLIKE')),
    CONSTRAINT uk_user_match_comment_reaction_user_match UNIQUE (user_id, user_match_id)
);

CREATE INDEX IF NOT EXISTS idx_umcr_user_match_id ON user_match_comment_reactions (user_match_id);
CREATE INDEX IF NOT EXISTS idx_umcr_user_id ON user_match_comment_reactions (user_id);

