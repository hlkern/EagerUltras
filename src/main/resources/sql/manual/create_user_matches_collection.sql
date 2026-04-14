-- PostgreSQL manual migration for "match collection" feature
-- Run this file once on eager_ultras database.

BEGIN;

-- Ensure stadium-team pair is uniquely identifiable for composite FK usage.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_stadium_teams_stadium_id_team_id'
    ) THEN
        ALTER TABLE stadium_teams
            ADD CONSTRAINT uk_stadium_teams_stadium_id_team_id UNIQUE (stadium_id, team_id);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS user_matches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stadium_id BIGINT NOT NULL,
    home_team_id BIGINT NOT NULL,
    away_team_id BIGINT NOT NULL,
    match_at TIMESTAMP NOT NULL,
    stadium_rating SMALLINT,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_matches_team_diff CHECK (home_team_id <> away_team_id),
    CONSTRAINT chk_user_matches_rating CHECK (stadium_rating IS NULL OR (stadium_rating BETWEEN 1 AND 10)),

    CONSTRAINT fk_user_matches_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_matches_stadium
        FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_matches_home_team
        FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_matches_away_team
        FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE RESTRICT
);

-- Enforce that selected home team is valid for the selected stadium.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_user_matches_home_team_stadium_pair'
    ) THEN
        ALTER TABLE user_matches
            ADD CONSTRAINT fk_user_matches_home_team_stadium_pair
            FOREIGN KEY (stadium_id, home_team_id)
            REFERENCES stadium_teams(stadium_id, team_id)
            ON DELETE RESTRICT;
    END IF;

    -- Away team can be any team except home team, so this FK must not exist.
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_user_matches_away_team_stadium_pair'
    ) THEN
        ALTER TABLE user_matches
            DROP CONSTRAINT fk_user_matches_away_team_stadium_pair;
    END IF;
END
$$;

-- Prevent duplicate records for the same user and exact match definition.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_user_matches_identity'
    ) THEN
        ALTER TABLE user_matches
            ADD CONSTRAINT uk_user_matches_identity
            UNIQUE (user_id, stadium_id, home_team_id, away_team_id, match_at);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_matches_user_id ON user_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_match_at ON user_matches(match_at);
CREATE INDEX IF NOT EXISTS idx_user_matches_stadium_id ON user_matches(stadium_id);

-- Keep updated_at in sync on update.
CREATE OR REPLACE FUNCTION set_user_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_matches_updated_at ON user_matches;
CREATE TRIGGER trg_user_matches_updated_at
BEFORE UPDATE ON user_matches
FOR EACH ROW
EXECUTE FUNCTION set_user_matches_updated_at();

COMMIT;
