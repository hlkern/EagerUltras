const profileMain = document.getElementById("profileMain");
const profileError = document.getElementById("profileError");
const profileTitle = document.getElementById("profileTitle");
const profileUsername = document.getElementById("profileUsername");
const profileFollowerCount = document.getElementById("profileFollowerCount");
const profileFollowingCount = document.getElementById("profileFollowingCount");
const profileRelationshipInfo = document.getElementById("profileRelationshipInfo");
const followActionBtn = document.getElementById("followActionBtn");
const followActionInfo = document.getElementById("followActionInfo");
const profileChatBtn = document.getElementById("profileChatBtn");
const profileMatches = document.getElementById("profileMatches");
const profileRatings = document.getElementById("profileRatings");
const profileComments = document.getElementById("profileComments");
const profileWishlist = document.getElementById("profileWishlist");
const profileCollectionStats = document.getElementById("profileCollectionStats");
const profileCollectionBtn = document.getElementById("profileCollectionBtn");
const profileCollectionMapInfo = document.getElementById("profileCollectionMapInfo");
const profileCollectionMapEl = document.getElementById("profileCollectionMap");

let profileCollectionMap = null;
let profileCollectionMarkers = [];

function t(key, vars = {}) {
    return window.HoopAroundI18n?.t?.(key, vars) ?? key;
}

function getCurrentUserId() {
    return window.HoopAroundLayout?.user?.id ?? null;
}

function getCurrentLanguage() {
    return window.HoopAroundI18n?.getLanguage?.() || "en";
}

function getTurkishPossessiveSuffix(name) {
    const value = String(name || "").trim();
    if (!value) return "'in";

    const digitVowelMap = {
        "0": "ı", // sifir
        "1": "i", // bir
        "2": "i", // iki
        "3": "ü", // uc
        "4": "ö", // dort
        "5": "e", // bes
        "6": "ı", // alti
        "7": "i", // yedi
        "8": "i", // sekiz
        "9": "u"  // dokuz
    };

    const normalized = value
        .toLocaleLowerCase("tr-TR")
        .replace(/[^a-zçğıöşü0-9]/gi, "");

    if (!normalized) return "'in";

    const vowels = ["a", "e", "ı", "i", "o", "ö", "u", "ü"];
    let lastVowel = digitVowelMap[normalized[normalized.length - 1]] || "";
    for (let i = normalized.length - 1; i >= 0; i -= 1) {
        if (vowels.includes(normalized[i])) {
            lastVowel = normalized[i];
            break;
        }
    }

    const endsWithVowel = vowels.includes(normalized[normalized.length - 1]);
    const suffixCore = (() => {
        if (["a", "ı"].includes(lastVowel)) return "ın";
        if (["e", "i"].includes(lastVowel)) return "in";
        if (["o", "u"].includes(lastVowel)) return "un";
        if (["ö", "ü"].includes(lastVowel)) return "ün";
        return "in";
    })();

    return endsWithVowel ? `'n${suffixCore}` : `'${suffixCore}`;
}

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function formatDate(value) {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString(window.HoopAroundI18n?.getLocale?.() || "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function goStadium(stadium) {
    if (!stadium?.name) return;
    window.location.href = `/stadyum/${toSlug(stadium.name)}`;
}

function createMatchCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = match.stadium?.name || "-";

    const teams = document.createElement("p");
    teams.className = "stadium-card-meta";
    teams.textContent = `${match.homeTeam?.name || "-"} vs ${match.awayTeam?.name || "-"}`;

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `${t("collection_add_match_date")}: ${formatDate(match.matchAt)}`;

    card.append(title, teams, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createRatingCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = match.stadium?.name || "-";

    const rating = document.createElement("p");
    rating.className = "stadium-card-meta";
    rating.textContent = `${t("map_avg_rating")}: ${match.stadiumRating}`;

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `${t("collection_add_match_date")}: ${formatDate(match.matchAt)}`;

    card.append(title, rating, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createCommentCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = match.stadium?.name || "-";

    const comment = document.createElement("p");
    comment.className = "stadium-card-meta";
    comment.textContent = match.comment || "-";

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `${t("collection_add_match_date")}: ${formatDate(match.matchAt)}`;

    card.append(title, comment, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createWishlistCard(stadium) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = stadium.name || "-";

    const meta = document.createElement("p");
    meta.className = "stadium-card-meta";
    meta.textContent = `${stadium.country?.name || "-"} | ${stadium.city || "-"}`;

    card.append(title, meta);
    card.addEventListener("click", () => goStadium(stadium));
    return card;
}

function renderList(container, items, createCard, emptyText) {
    if (!container) return;
    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = `<div class="empty">${emptyText}</div>`;
        return;
    }

    items.forEach((item) => container.appendChild(createCard(item)));
}

function renderFollowSummary(data) {
    if (profileFollowerCount) {
        profileFollowerCount.textContent = String(data.followerCount ?? 0);
    }
    if (profileFollowingCount) {
        profileFollowingCount.textContent = String(data.followingCount ?? 0);
    }
}

function renderRelationshipInfo(data) {
    if (!profileRelationshipInfo) return;

    if (data?.followsViewer) {
        profileRelationshipInfo.textContent = getCurrentLanguage() === "tr" ? "Seni takip ediyor" : "Follows you";
        profileRelationshipInfo.classList.remove("hidden");
        return;
    }

    profileRelationshipInfo.textContent = "";
    profileRelationshipInfo.classList.add("hidden");
}

async function toggleFollow(data) {
    const viewerUserId = getCurrentUserId();
    if (!viewerUserId || !data?.id) return;

    const isFollowing = !!data.followedByViewer;
    const method = isFollowing ? "DELETE" : "POST";

    followActionBtn.disabled = true;
    followActionInfo.classList.add("hidden");

    try {
        const response = await fetch(`/api/user-follows/${viewerUserId}/${data.id}`, { method });
        if (!(response.status === 204 || response.ok)) {
            const payload = await response.json().catch(() => null);
            followActionInfo.textContent = payload?.message || payload?.error || "Follow action failed.";
            followActionInfo.classList.remove("hidden");
            return;
        }

        data.followedByViewer = !isFollowing;
        data.followerCount = Number(data.followerCount || 0) + (data.followedByViewer ? 1 : -1);
        if (data.followerCount < 0) data.followerCount = 0;
        renderFollowSummary(data);
        followActionBtn.textContent = data.followedByViewer
            ? (getCurrentLanguage() === "tr" ? "Takibi bırak" : "Unfollow")
            : (getCurrentLanguage() === "tr" ? "Takip et" : "Follow");
    } catch {
        followActionInfo.textContent = "Follow action failed.";
        followActionInfo.classList.remove("hidden");
    } finally {
        followActionBtn.disabled = false;
    }
}

function renderFollowActions(data) {
    if (!followActionBtn || !followActionInfo) return;

    const viewerUserId = getCurrentUserId();
    const canFollow = !!viewerUserId && !data.ownProfile;

    followActionInfo.classList.add("hidden");

    if (!canFollow) {
        followActionBtn.classList.add("hidden");
        followActionBtn.onclick = null;
        followActionInfo.textContent = data.ownProfile
            ? (getCurrentLanguage() === "tr" ? "Bu senin profilin" : "This is your profile")
            : (getCurrentLanguage() === "tr" ? "Takip etmek için giriş yap" : "Log in to follow");
        followActionInfo.classList.remove("hidden");
        return;
    }

    followActionBtn.classList.remove("hidden");
    followActionBtn.disabled = false;
    followActionBtn.textContent = data.followedByViewer
        ? (getCurrentLanguage() === "tr" ? "Takibi bırak" : "Unfollow")
        : (getCurrentLanguage() === "tr" ? "Takip et" : "Follow");
    followActionBtn.onclick = () => toggleFollow(data);
}

function renderChatAction(data) {
    if (!profileChatBtn) return;

    const target = data?.ownProfile ? "/chat.html" : `/chat.html?username=${encodeURIComponent(data.username || "")}`;
    profileChatBtn.onclick = () => {
        window.location.href = target;
    };
}

function renderCollectionStats(matches) {
    if (!profileCollectionStats) return;

    const uniqueStadiums = new Set((matches || []).map((match) => match?.stadium?.id).filter(Boolean));
    profileCollectionStats.innerHTML = "";

    const stats = [
        { title: t("profile_collection_matches"), value: Array.isArray(matches) ? matches.length : 0 },
        { title: t("profile_collection_stadiums"), value: uniqueStadiums.size }
    ];

    stats.forEach((item) => {
        const card = document.createElement("article");
        card.className = "stadium-card-item";

        const title = document.createElement("h4");
        title.textContent = item.title;

        const value = document.createElement("p");
        value.className = "stadium-card-meta";
        value.textContent = String(item.value);

        card.append(title, value);
        profileCollectionStats.appendChild(card);
    });
}

function createCollectionMarker() {
    return L.divIcon({
        className: "collection-marker-wrap",
        html: '<div class="collection-marker">🏟️</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
}

function ensureProfileCollectionMap() {
    if (!profileCollectionMapEl || profileCollectionMap) return profileCollectionMap;
    profileCollectionMap = L.map(profileCollectionMapEl).setView([39.5, 35.0], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(profileCollectionMap);
    return profileCollectionMap;
}

function renderCollectionMap(matches) {
    if (!profileCollectionMapInfo || !profileCollectionMapEl) return;

    const map = ensureProfileCollectionMap();
    profileCollectionMarkers.forEach((marker) => map.removeLayer(marker));
    profileCollectionMarkers = [];

    const uniqueVisited = new Map();
    (Array.isArray(matches) ? matches : []).forEach((match) => {
        const stadium = match?.stadium;
        if (!stadium?.id || stadium.latitude == null || stadium.longitude == null) return;
        if (!uniqueVisited.has(stadium.id)) {
            uniqueVisited.set(stadium.id, stadium);
        }
    });

    const visitedStadiums = Array.from(uniqueVisited.values());
    if (visitedStadiums.length === 0) {
        profileCollectionMapInfo.textContent = getCurrentLanguage() === "tr"
            ? "Bu kullanıcı henüz stadyum haritası oluşturacak kadar maç eklemedi."
            : "This user does not have enough visited stadiums for a map yet.";
        return;
    }

    const bounds = [];
    visitedStadiums.forEach((stadium) => {
        const marker = L.marker([stadium.latitude, stadium.longitude], {
            icon: createCollectionMarker(),
            keyboard: true
        });
        marker.bindPopup(`
            <div style="min-width:160px;font-family:Inter,sans-serif;font-size:13px;">
                <strong style="font-size:14px;">${stadium.name || "Stadium"}</strong><br/>
                <span style="color:#888;">${stadium.city || ""}${stadium.country?.name ? " | " + stadium.country.name : ""}</span>
            </div>
        `);
        marker.on("click", () => {
            map.flyTo([stadium.latitude, stadium.longitude], 14, {
                animate: true,
                duration: 0.8
            });
        });
        marker.addTo(map);
        profileCollectionMarkers.push(marker);
        bounds.push([stadium.latitude, stadium.longitude]);
    });

    profileCollectionMapInfo.textContent = t("profile_collection_map");
    if (bounds.length === 1) {
        map.setView(bounds[0], 12);
    } else {
        map.fitBounds(bounds, { padding: [24, 24] });
    }
    window.setTimeout(() => map.invalidateSize(), 0);
}

function renderCollectionAction(data) {
    if (!profileCollectionBtn) return;
    profileCollectionBtn.onclick = () => {
        window.location.href = `/collection.html?username=${encodeURIComponent(data.username || "")}`;
    };
}

function renderProfile(data) {
    const username = data.username || "User";
    profileTitle.textContent = getCurrentLanguage() === "tr"
        ? t("profile_title_user", { name: username, suffix: getTurkishPossessiveSuffix(username) })
        : t("profile_title_user", { name: username });
    profileUsername.textContent = `@${data.username}`;

    renderFollowSummary(data);
    renderRelationshipInfo(data);
    renderFollowActions(data);
    renderChatAction(data);
    renderCollectionAction(data);

    const matches = Array.isArray(data.matches) ? data.matches : [];
    const ratedMatches = matches.filter((match) => match.stadiumRating != null);
    const commentedMatches = matches.filter((match) => !!String(match.comment || "").trim());

    renderList(profileMatches, matches, createMatchCard, getCurrentLanguage() === "tr" ? "Bu kullanıcının henüz maç kaydı yok." : "This user has no match records yet.");
    renderList(profileRatings, ratedMatches, createRatingCard, getCurrentLanguage() === "tr" ? "Bu kullanıcı henüz maç puanlamadı." : "This user has not rated any matches yet.");
    renderList(profileComments, commentedMatches, createCommentCard, getCurrentLanguage() === "tr" ? "Bu kullanıcı henüz yorum yazmadı." : "This user has not written any comments yet.");
    renderList(profileWishlist, data.wishlist, createWishlistCard, getCurrentLanguage() === "tr" ? "Wishlist boş." : "Wishlist is empty.");
    renderCollectionStats(matches);
    renderCollectionMap(matches);

    profileMain.classList.remove("hidden");
    profileError.classList.add("hidden");
}

async function loadProfile() {
    const username = new URLSearchParams(window.location.search).get("username");
    if (!username) {
        profileError.classList.remove("hidden");
        return;
    }

    const viewerUserId = getCurrentUserId();
    const query = viewerUserId ? `?viewerUserId=${encodeURIComponent(viewerUserId)}` : "";

    try {
        const response = await fetch(`/api/public/users/${encodeURIComponent(username)}${query}`);
        if (!response.ok) {
            profileError.classList.remove("hidden");
            return;
        }

        const data = await response.json();
        renderProfile(data);
    } catch {
        profileError.classList.remove("hidden");
    }
}

loadProfile();
