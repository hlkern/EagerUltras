-- Extends country code column to support 3-letter ISO codes (ENG, FRA, DEU etc.)
-- Run before import_european_stadiums.sql if countries.code was created as VARCHAR(2)

ALTER TABLE countries
    ALTER COLUMN code TYPE VARCHAR(10);
