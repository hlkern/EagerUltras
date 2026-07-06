BEGIN;

CREATE TABLE IF NOT EXISTS post_likes (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_post_likes_pair UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL,
    author_id   BIGINT NOT NULL,
    content     VARCHAR(1000) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_comments_post   FOREIGN KEY (post_id)   REFERENCES posts(id)   ON DELETE CASCADE,
    CONSTRAINT fk_post_comments_author FOREIGN KEY (author_id) REFERENCES users(id)   ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id    ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id    ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

COMMIT;
