const profileMain = document.getElementById("profileMain");
const profileError = document.getElementById("profileError");
const profileTitle = document.getElementById("profileTitle");
const profileUsername = document.getElementById("profileUsername");
const profileMatches = document.getElementById("profileMatches");
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

    const score = document.createElement("p");
    score.className = "stadium-card-meta";
    score.textContent = `Puan: ${match.stadiumRating ?? "-"} | Tarih: ${formatDate(match.matchAt)}`;

    const comment = document.createElement("p");
    comment.className = "stadium-card-meta";
    comment.textContent = `Yorum: ${match.comment || "-"}`;

    card.append(title, teams, score, comment);
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

function renderProfile(data) {
    profileTitle.textContent = `${data.username} profili`;
    profileUsername.textContent = `@${data.username}`;

    profileMatches.innerHTML = "";
    const matches = Array.isArray(data.matches) ? data.matches : [];
    if (matches.length === 0) {
        profileMatches.innerHTML = '<div class="empty">Bu kullanicinin mac kaydi yok.</div>';
    } else {
        matches.forEach((match) => profileMatches.appendChild(createMatchCard(match)));
    }

    profileWishlist.innerHTML = "";
    const wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
    if (wishlist.length === 0) {
        profileWishlist.innerHTML = '<div class="empty">Wishlist bos.</div>';
    } else {
        wishlist.forEach((stadium) => profileWishlist.appendChild(createWishlistCard(stadium)));
    }

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

