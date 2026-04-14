-- Run this if old schema still has away-team-to-stadium pair restriction.
ALTER TABLE user_matches
DROP CONSTRAINT IF EXISTS fk_user_matches_away_team_stadium_pair;

