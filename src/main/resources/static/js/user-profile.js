const profileMain = document.getElementById("profileMain");
const profileError = document.getElementById("profileError");
const profileTitle = document.getElementById("profileTitle");
const profileUsername = document.getElementById("profileUsername");
const profileMatches = document.getElementById("profileMatches");
const profileRatings = document.getElementById("profileRatings");
const profileComments = document.getElementById("profileComments");
const profileWishlist = document.getElementById("profileWishlist");

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
    return dt.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
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
    title.textContent = match.stadium?.name || "Bilinmeyen stad";

    const teams = document.createElement("p");
    teams.className = "stadium-card-meta";
    teams.textContent = `${match.homeTeam?.name || "-"} vs ${match.awayTeam?.name || "-"}`;

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `Tarih: ${formatDate(match.matchAt)}`;

    card.append(title, teams, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createRatingCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = match.stadium?.name || "Bilinmeyen stad";

    const rating = document.createElement("p");
    rating.className = "stadium-card-meta";
    rating.textContent = `Puan: ${match.stadiumRating}`;

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `Mac tarihi: ${formatDate(match.matchAt)}`;

    card.append(title, rating, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createCommentCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = match.stadium?.name || "Bilinmeyen stad";

    const comment = document.createElement("p");
    comment.className = "stadium-card-meta";
    comment.textContent = match.comment || "-";

    const date = document.createElement("p");
    date.className = "stadium-card-meta";
    date.textContent = `Mac tarihi: ${formatDate(match.matchAt)}`;

    card.append(title, comment, date);
    card.addEventListener("click", () => goStadium(match.stadium));
    return card;
}

function createWishlistCard(stadium) {
    const card = document.createElement("article");
    card.className = "stadium-card-item card-link";

    const title = document.createElement("h4");
    title.textContent = stadium.name || "Bilinmeyen stad";

    const meta = document.createElement("p");
    meta.className = "stadium-card-meta";
    meta.textContent = `${stadium.country?.name || "Unknown country"} | ${stadium.city || "Unknown city"}`;

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

function renderProfile(data) {
    profileTitle.textContent = `${data.username} profili`;
    profileUsername.textContent = `@${data.username}`;

    const matches = Array.isArray(data.matches) ? data.matches : [];
    const ratedMatches = matches.filter((match) => match.stadiumRating != null);
    const commentedMatches = matches.filter((match) => !!String(match.comment || "").trim());

    renderList(profileMatches, matches, createMatchCard, "Bu kullanicinin mac kaydi yok.");
    renderList(profileRatings, ratedMatches, createRatingCard, "Bu kullanici henuz puan vermemis.");
    renderList(profileComments, commentedMatches, createCommentCard, "Bu kullanici henuz yorum yazmamis.");
    renderList(profileWishlist, data.wishlist, createWishlistCard, "Wishlist bos.");

    profileMain.classList.remove("hidden");
    profileError.classList.add("hidden");
}

async function loadProfile() {
    const username = new URLSearchParams(window.location.search).get("username");
    if (!username) {
        profileError.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch(`/api/public/users/${encodeURIComponent(username)}`);
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
