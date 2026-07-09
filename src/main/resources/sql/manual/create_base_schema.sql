-- Base schema: users, countries, teams, stadiums, stadium_teams, user_stadiums
-- Run this FIRST before any other migration.

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id       BIGSERIAL PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    notifications_seen_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS countries (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10)  NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teams (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    country_id BIGINT,
    CONSTRAINT fk_teams_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stadiums (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    city       VARCHAR(255),
    capacity   INTEGER,
    latitude   DOUBLE PRECISION,
    longitude  DOUBLE PRECISION,
    country_id BIGINT,
    CONSTRAINT fk_stadiums_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stadium_teams (
    stadium_id BIGINT NOT NULL,
    team_id    BIGINT NOT NULL,
    PRIMARY KEY (stadium_id, team_id),
    CONSTRAINT fk_stadium_teams_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE,
    CONSTRAINT fk_stadium_teams_team    FOREIGN KEY (team_id)    REFERENCES teams(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_stadiums (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    stadium_id BIGINT NOT NULL,
    visit_date DATE,
    CONSTRAINT fk_user_stadiums_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_user_stadiums_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_stadium_user_id_stadium_id UNIQUE (user_id, stadium_id)
);

CREATE INDEX IF NOT EXISTS idx_user_stadiums_user_id    ON user_stadiums(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stadiums_stadium_id ON user_stadiums(stadium_id);
CREATE INDEX IF NOT EXISTS idx_stadiums_country_id      ON stadiums(country_id);
CREATE INDEX IF NOT EXISTS idx_teams_country_id         ON teams(country_id);

COMMIT;
