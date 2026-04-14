ALTER TABLE user_stadiums
ADD CONSTRAINT uk_user_stadium_user_id_stadium_id UNIQUE (user_id, stadium_id);

