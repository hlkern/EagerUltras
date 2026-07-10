const HOOPAROUND_LANGUAGE_KEY = "hooparound_language";

const HOOPAROUND_TRANSLATIONS = {
    en: {
        nav_home: "Home",
        nav_profile: "My Profile",
        nav_countries: "Countries",
        nav_stadiums: "Stadiums",
        nav_teams: "Teams",
        nav_wishlist: "Wishlist",
        nav_collection: "My Collection",
        nav_add_match: "Add Match",
        nav_map: "Map",
        nav_chat: "Chat",
        action_logout: "Logout",
        action_en: "EN",
        action_tr: "TR",
        main_tagline: "Your journey starts here.",
        main_quick_search: "Quick search",
        main_quick_search_desc: "Search teams, stadiums, and leagues. Click a result to open its page.",
        main_search_label: "Search",
        main_search_placeholder: "Example: Turkey, Fenerbahce, Ulker",
        main_latest_visited: "Latest visited stadium",
        main_next_goals: "Next Goals",
        main_notifications: "Notifications",
        main_create_post: "Create post",
        main_add_match: "Add match to collection",
        main_comments: "Comments",
        main_comment_placeholder: "Write a comment...",
        main_send: "Send",
        main_post_placeholder: "What are you thinking?",
        main_add_photo: "Add photo (optional)",
        main_share: "Share",
        search_label: "Search",
        collection_title: "My Collection",
        collection_matches: "Matches I attended",
        collection_team_summary: "Team summary",
        collection_stadium_summary: "Stadium summary",
        collection_share: "Share collection",
        collection_share_done: "Collection link copied.",
        collection_share_fail: "Collection link could not be copied.",
        collection_map_title: "My Map",
        collection_map_desc: "A personalized map showing only visited stadiums.",
        collection_map_empty: "No visited stadiums to show on the map yet.",
        collection_public_suffix: "'s Collection",
        collection_open_profile: "Open profile",
        collection_add_page_title: "Add Match",
        collection_add_heading: "Add a match to your collection",
        collection_add_desc: "Choose the stadium, teams, date, rating, and comment.",
        collection_add_stadium: "Stadium",
        collection_add_stadium_placeholder: "Type to find a stadium",
        collection_add_home_team: "Home team",
        collection_add_home_team_placeholder: "Type to choose the home team",
        collection_add_away_team: "Away team",
        collection_add_away_team_placeholder: "Type to choose the away team",
        collection_add_match_date: "Match date",
        collection_add_rating: "Stadium rating (1-10)",
        collection_add_comment: "Comment",
        collection_add_comment_placeholder: "Write about your match experience...",
        collection_add_submit: "Add match to collection",
        countries_title: "Countries",
        countries_heading: "Countries / Leagues",
        countries_desc: "Select a country to see stadiums.",
        countries_search_placeholder: "Search countries or stadiums",
        countries_stadium_details: "Stadium details",
        detail_id: "ID",
        detail_name: "Name",
        detail_teams: "Teams",
        detail_city: "City",
        detail_capacity: "Capacity",
        detail_country: "Country",
        detail_latitude: "Latitude",
        detail_longitude: "Longitude",
        stadiums_title: "Stadiums",
        stadiums_heading: "All Stadiums",
        stadiums_desc: "Click a stadium for quick details.",
        stadiums_search_placeholder: "Search stadiums, cities, countries, or teams",
        stadiums_filter_all: "All",
        stadiums_filter_visited: "Visited",
        stadiums_filter_not_visited: "Not Visited",
        teams_title: "Teams",
        teams_heading: "All Teams",
        teams_desc: "Click a team to open its detail page.",
        teams_search_placeholder: "Search teams",
        wishlist_title: "Wishlist",
        wishlist_heading: "Stadiums I want to visit",
        auth_subtitle: "Track every stadium you visit, build your fan journey, and share your route with the community.",
        auth_badge_1: "Stadium Tracker",
        auth_badge_2: "Fan Journey",
        auth_badge_3: "Community",
        auth_login: "Login",
        auth_register: "Register",
        auth_welcome_back: "Welcome back",
        auth_create_account: "Create account",
        auth_email: "Email",
        auth_password: "Password",
        auth_username: "Username",
        auth_password_placeholder: "Enter password",
        auth_password_min_placeholder: "At least 6 chars",
        auth_sign_in: "Sign in",
        auth_create_button: "Create account",
        chat_title: "Chat",
        chat_new_title: "Start a new chat",
        chat_search_placeholder: "Search username",
        chat_open: "Open chat",
        chat_previous: "Previous chats",
        chat_select: "Select a chat",
        chat_message_placeholder: "Write a message...",
        chat_no_chats: "No chats yet.",
        chat_no_messages: "No messages in this chat yet.",
        chat_user_not_found: "User not found.",
        notifications_title: "Notifications",
        notifications_all: "All notifications",
        notifications_desc: "Your follow, like, and comment history.",
        profile_title: "User profile",
        profile_title_user: "{name}'s profile",
        profile_summary: "Matches, ratings, comments, and wishlist",
        profile_chat: "Go to chat",
        profile_followers: "Followers",
        profile_following: "Following",
        profile_matches: "Matches",
        profile_ratings: "Ratings",
        profile_comments: "Comments",
        profile_wishlist: "Wishlist",
        profile_collection: "Collection",
        profile_collection_desc: "See this user's full collection and visited stadium map.",
        profile_open_collection: "Open full collection",
        profile_collection_matches: "Collection matches",
        profile_collection_stadiums: "Visited stadiums",
        profile_collection_map: "Visited stadium map",
        profile_not_found: "User not found",
        profile_not_found_desc: "This profile could not be reached.",
        stadium_detail_title: "Stadium detail",
        stadium_detail_comments: "Visitor comments",
        stadium_detail_avg_rating: "Average rating: {value} ({count} ratings)",
        stadium_detail_not_found: "Stadium not found",
        stadium_detail_not_found_desc: "No stadium was found for this link. You can try again from the Stadiums page.",
        stadium_detail_back: "Back to Stadiums",
        detail_location: "Location",
        team_detail_title: "Team detail",
        team_detail_stadiums: "Stadiums used by this team",
        team_detail_not_found: "Team not found",
        team_detail_not_found_desc: "No team was found for this link. You can try again from the Teams page.",
        team_detail_back: "Back to Teams",
        map_legend_visited: "Visited",
        map_legend_wishlist: "In my wishlist",
        map_legend_other: "Unvisited stadiums",
        map_filter_all: "All",
        map_filter_visited: "Visited",
        map_filter_wishlist: "Wishlist",
        map_filter_unvisited: "Unvisited",
        map_open_stadium: "Open stadium page",
        map_loading: "Loading...",
        map_loading_map: "Loading map...",
        map_map_error: "Map could not be loaded.",
        map_stadium_not_found: "Stadium not found.",
        map_no_comments: "No comments yet.",
        map_view_full_page: "View full page",
        map_data_error: "Data could not be loaded.",
        map_add_wishlist: "Add to wishlist",
        map_remove_wishlist: "Remove from wishlist",
        map_capacity: "Capacity",
        map_avg_rating: "Avg. rating",
        map_visitor_comments: "Visitor comments",
        map_stadium_count: "{total} stadiums on the map | {visited} visited | {wishlist} in wishlist",
        welcome_user: "Welcome, {name}",
        open_menu: "Open menu"
    },
    tr: {
        nav_home: "Ana Sayfa",
        nav_profile: "Profilim",
        nav_countries: "Ülkeler",
        nav_stadiums: "Stadyumlar",
        nav_teams: "Takımlar",
        nav_wishlist: "Wishlist",
        nav_collection: "Koleksiyonum",
        nav_add_match: "Maç Ekle",
        nav_map: "Harita",
        nav_chat: "Sohbet",
        action_logout: "Çıkış",
        action_en: "EN",
        action_tr: "TR",
        main_tagline: "Yolculuğun burada başlıyor.",
        main_quick_search: "Hızlı arama",
        main_quick_search_desc: "Takımları, stadyumları ve ligleri ara. Sonuca tıklayıp sayfasını aç.",
        main_search_label: "Ara",
        main_search_placeholder: "Örnek: Turkey, Fenerbahce, Ulker",
        main_latest_visited: "Son ziyaret edilen stadyum",
        main_next_goals: "Sıradaki Hedefler",
        main_notifications: "Bildirimler",
        main_create_post: "Gönderi oluştur",
        main_add_match: "Koleksiyona maç ekle",
        main_comments: "Yorumlar",
        main_comment_placeholder: "Yorum yaz...",
        main_send: "Gönder",
        main_post_placeholder: "Ne düşünüyorsun?",
        main_add_photo: "Fotoğraf ekle (isteğe bağlı)",
        main_share: "Paylaş",
        search_label: "Ara",
        collection_title: "Koleksiyonum",
        collection_matches: "Gittiğim maçlar",
        collection_team_summary: "Takım özeti",
        collection_stadium_summary: "Stadyum özeti",
        collection_share: "Koleksiyonu paylaş",
        collection_share_done: "Koleksiyon bağlantısı kopyalandı.",
        collection_share_fail: "Koleksiyon bağlantısı kopyalanamadı.",
        collection_map_title: "Haritam",
        collection_map_desc: "Sadece gidilen stadyumları gösteren kişisel harita.",
        collection_map_empty: "Haritada gösterilecek ziyaret edilmiş stadyum yok.",
        collection_public_suffix: " koleksiyonu",
        collection_open_profile: "Profili aç",
        collection_add_page_title: "Maç Ekle",
        collection_add_heading: "Koleksiyonuna maç ekle",
        collection_add_desc: "Stadyum, takımlar, tarih, puan ve yorumu seç.",
        collection_add_stadium: "Stadyum",
        collection_add_stadium_placeholder: "Yazarak stadyum bul",
        collection_add_home_team: "Ev sahibi takım",
        collection_add_home_team_placeholder: "Yazarak ev sahibi takımı seç",
        collection_add_away_team: "Deplasman takımı",
        collection_add_away_team_placeholder: "Yazarak deplasman takımını seç",
        collection_add_match_date: "Maç tarihi",
        collection_add_rating: "Stadyum puanı (1-10)",
        collection_add_comment: "Yorum",
        collection_add_comment_placeholder: "Maç deneyimini yaz...",
        collection_add_submit: "Koleksiyona maç ekle",
        countries_title: "Ülkeler",
        countries_heading: "Ülkeler / Ligler",
        countries_desc: "Stadyumları görmek için bir ülke seç.",
        countries_search_placeholder: "Ülke veya stadyum ara",
        countries_stadium_details: "Stadyum detayları",
        detail_id: "ID",
        detail_name: "İsim",
        detail_teams: "Takımlar",
        detail_city: "Şehir",
        detail_capacity: "Kapasite",
        detail_country: "Ülke",
        detail_latitude: "Enlem",
        detail_longitude: "Boylam",
        stadiums_title: "Stadyumlar",
        stadiums_heading: "Tüm Stadyumlar",
        stadiums_desc: "Hızlı detaylar için bir stadyuma tıkla.",
        stadiums_search_placeholder: "Stadyum, şehir, ülke veya takım ara",
        stadiums_filter_all: "Hepsi",
        stadiums_filter_visited: "Gidilen",
        stadiums_filter_not_visited: "Gidilmeyen",
        teams_title: "Takımlar",
        teams_heading: "Tüm Takımlar",
        teams_desc: "Detay sayfasını açmak için bir takıma tıkla.",
        teams_search_placeholder: "Takım ara",
        wishlist_title: "Wishlist",
        wishlist_heading: "Gitmek istediğim stadyumlar",
        auth_subtitle: "Gittiğin her stadyumu takip et, taraftar yolculuğunu oluştur ve rotanı toplulukla paylaş.",
        auth_badge_1: "Stadyum Takibi",
        auth_badge_2: "Taraftar Yolculuğu",
        auth_badge_3: "Topluluk",
        auth_login: "Giriş",
        auth_register: "Kayıt Ol",
        auth_welcome_back: "Tekrar hoş geldin",
        auth_create_account: "Hesap oluştur",
        auth_email: "E-posta",
        auth_password: "Şifre",
        auth_username: "Kullanıcı adı",
        auth_password_placeholder: "Şifreni gir",
        auth_password_min_placeholder: "En az 6 karakter",
        auth_sign_in: "Giriş yap",
        auth_create_button: "Hesap oluştur",
        chat_title: "Sohbet",
        chat_new_title: "Yeni bir sohbet başlat",
        chat_search_placeholder: "Kullanıcı adı ara",
        chat_open: "Sohbet aç",
        chat_previous: "Önceki sohbetler",
        chat_select: "Bir sohbet seç",
        chat_message_placeholder: "Mesaj yaz...",
        chat_no_chats: "Henüz sohbet yok.",
        chat_no_messages: "Bu sohbette henüz mesaj yok.",
        chat_user_not_found: "Kullanıcı bulunamadı.",
        notifications_title: "Bildirimler",
        notifications_all: "Tüm bildirimler",
        notifications_desc: "Takip, beğeni ve yorum geçmişin.",
        profile_title: "Kullanıcı profili",
        profile_title_user: "{name}{suffix} profili",
        profile_summary: "Maçlar, puanlar, yorumlar ve wishlist",
        profile_chat: "Sohbete git",
        profile_followers: "Takipçiler",
        profile_following: "Takip edilen",
        profile_matches: "Maçlar",
        profile_ratings: "Puanlar",
        profile_comments: "Yorumlar",
        profile_wishlist: "Wishlist",
        profile_collection: "Koleksiyon",
        profile_collection_desc: "Bu kullanıcının tam koleksiyonunu ve ziyaret edilen stadyum haritasını gör.",
        profile_open_collection: "Tüm koleksiyonu aç",
        profile_collection_matches: "Koleksiyondaki maçlar",
        profile_collection_stadiums: "Gidilen stadyumlar",
        profile_collection_map: "Gidilen stadyum haritası",
        profile_not_found: "Kullanıcı bulunamadı",
        profile_not_found_desc: "Bu profile ulaşılamadı.",
        stadium_detail_title: "Stadyum detayı",
        stadium_detail_comments: "Ziyaretçi yorumları",
        stadium_detail_avg_rating: "Ortalama puan: {value} ({count} puan)",
        stadium_detail_not_found: "Stadyum bulunamadı",
        stadium_detail_not_found_desc: "Bu bağlantı için stadyum bulunamadı. Stadyumlar sayfasından tekrar deneyebilirsin.",
        stadium_detail_back: "Stadyumlara dön",
        detail_location: "Konum",
        team_detail_title: "Takım detayı",
        team_detail_stadiums: "Bu takımın kullandığı stadyumlar",
        team_detail_not_found: "Takım bulunamadı",
        team_detail_not_found_desc: "Bu bağlantı için takım bulunamadı. Takımlar sayfasından tekrar deneyebilirsin.",
        team_detail_back: "Takımlara dön",
        map_legend_visited: "Gidilen",
        map_legend_wishlist: "Wishlistimde",
        map_legend_other: "Gidilmeyen stadyumlar",
        map_filter_all: "Hepsi",
        map_filter_visited: "Gidilen",
        map_filter_wishlist: "Wishlist",
        map_filter_unvisited: "Gidilmeyen",
        map_open_stadium: "Stadyum sayfasını aç",
        map_loading: "Yükleniyor...",
        map_loading_map: "Harita yükleniyor...",
        map_map_error: "Harita yüklenemedi.",
        map_stadium_not_found: "Stadyum bulunamadı.",
        map_no_comments: "Henüz yorum yok.",
        map_view_full_page: "Tam sayfayı aç",
        map_data_error: "Veriler yüklenemedi.",
        map_add_wishlist: "Wishliste ekle",
        map_remove_wishlist: "Wishlistten çıkar",
        map_capacity: "Kapasite",
        map_avg_rating: "Ort. puan",
        map_visitor_comments: "Ziyaretçi yorumları",
        map_stadium_count: "Haritada {total} stadyum | {visited} gidilen | {wishlist} wishlistte",
        welcome_user: "Hoş geldin, {name}",
        open_menu: "Menüyü aç"
    }
};

function getHoopAroundLanguage() {
    return localStorage.getItem(HOOPAROUND_LANGUAGE_KEY) === "tr" ? "tr" : "en";
}

function setHoopAroundLanguage(language) {
    const nextLanguage = language === "tr" ? "tr" : "en";
    localStorage.setItem(HOOPAROUND_LANGUAGE_KEY, nextLanguage);
    return nextLanguage;
}

function getLocale() {
    return getHoopAroundLanguage() === "tr" ? "tr-TR" : "en-US";
}

function translateValue(key, vars = {}) {
    const language = getHoopAroundLanguage();
    const template = HOOPAROUND_TRANSLATIONS[language]?.[key] ?? HOOPAROUND_TRANSLATIONS.en?.[key] ?? key;
    return String(template).replace(/\{(\w+)}/g, (_, token) => vars[token] ?? "");
}

function applyStaticTranslations() {
    document.documentElement.lang = getHoopAroundLanguage();

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (key) {
            element.textContent = translateValue(key);
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (key) {
            element.setAttribute("placeholder", translateValue(key));
        }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const key = element.getAttribute("data-i18n-aria-label");
        if (key) {
            element.setAttribute("aria-label", translateValue(key));
        }
    });

    const welcomeTitle = document.getElementById("welcomeTitle");
    const user = window.HoopAroundLayout?.user;
    if (welcomeTitle && user) {
        welcomeTitle.textContent = translateValue("welcome_user", {
            name: user.username || user.email || "Groundhooper"
        });
    }

    document.querySelectorAll("[data-language-button]").forEach((button) => {
        button.classList.toggle("active", button.getAttribute("data-language-button") === getHoopAroundLanguage());
    });
}

function initLanguageButtons() {
    document.querySelectorAll("[data-language-button]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextLanguage = button.getAttribute("data-language-button");
            if (!nextLanguage || nextLanguage === getHoopAroundLanguage()) return;
            setHoopAroundLanguage(nextLanguage);
            window.location.reload();
        });
    });
}

initLanguageButtons();
applyStaticTranslations();

window.HoopAroundI18n = {
    getLanguage: getHoopAroundLanguage,
    setLanguage: setHoopAroundLanguage,
    getLocale,
    t: translateValue,
    apply: applyStaticTranslations
};
