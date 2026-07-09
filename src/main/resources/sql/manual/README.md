# SQL Migration Sırası

Yeni bir veritabanına kurulum yaparken dosyaları aşağıdaki sırayla çalıştır:

```bash
# 1. Temel tablolar (users, countries, teams, stadiums, user_stadiums)
psql -U postgres -d eager_ultras -f create_base_schema.sql

# 2. Maç koleksiyonu (user_matches)
psql -U postgres -d eager_ultras -f create_user_matches_collection.sql

# 3. Maç yorum reaksiyonları
psql -U postgres -d eager_ultras -f create_user_match_comment_reactions.sql

# 4. Stadyum unique index düzeltmesi
psql -U postgres -d eager_ultras -f add_user_stadium_unique.sql

# 5. Away team FK kaldır (gerekirse)
psql -U postgres -d eager_ultras -f drop_away_team_stadium_pair_fk.sql

# 6. Wishlist
psql -U postgres -d eager_ultras -f create_user_wishlist_stadiums.sql

# 7. Takipçi sistemi
psql -U postgres -d eager_ultras -f create_user_follows.sql

# 8. Mesajlaşma
psql -U postgres -d eager_ultras -f create_user_chat_tables.sql

# 9. Okunmamış mesaj kolonu
psql -U postgres -d eager_ultras -f add_message_read_at.sql

# 10. Notification seen kolonu
psql -U postgres -d eager_ultras -f add_notifications_seen_at.sql

# 11. Gönderi (post) tabloları
psql -U postgres -d eager_ultras -f create_posts.sql
psql -U postgres -d eager_ultras -f create_post_interactions.sql

# --- Opsiyonel: Stadyum verisi import ---

# 12a. İngiltere/Fransa/Almanya/İskoçya/İspanya (jokecamp CSV)
psql -U postgres -d eager_ultras -f import_european_stadiums.sql

# 12b. Geniş Avrupa verisi (İtalya, Hollanda, Portekiz, Belçika, Türkiye vb.)
psql -U postgres -d eager_ultras -f import_european_stadiums_extended.sql
```

> Tüm dosyalar idempotent'tir (`IF NOT EXISTS`, `WHERE NOT EXISTS`).
> Tekrar çalıştırılsa hata vermez.
