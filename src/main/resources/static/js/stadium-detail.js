const stadiumDetailCard = document.getElementById("stadiumDetailCard");
const stadiumDetailError = document.getElementById("stadiumDetailError");
const stadiumPageTitle = document.getElementById("stadiumPageTitle");
const stadiumName = document.getElementById("stadiumName");
const stadiumCountryCity = document.getElementById("stadiumCountryCity");
const stadiumTeams = document.getElementById("stadiumTeams");
const stadiumCapacity = document.getElementById("stadiumCapacity");
const stadiumLocation = document.getElementById("stadiumLocation");
const stadiumRating = document.getElementById("stadiumRating");
const stadiumComments = document.getElementById("stadiumComments");

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

function renderTeams(stadium) {
    const names = (stadium?.teams || []).map((team) => team?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "-";
}

function renderCommentItem(comment) {
    const item = document.createElement("div");
    item.className = "stadium-comment-item";

    const text = document.createElement("p");
    text.textContent = comment.comment || "-";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${comment.username || "unknown"} | Puan: ${comment.rating ?? "-"} | ${formatDate(comment.matchAt)}`;

    item.append(text, meta);
    return item;
}

function renderStadium(stadium, insights) {
    stadiumPageTitle.textContent = stadium.name || "Stadyum detayi";
    stadiumName.textContent = stadium.name || "-";
    stadiumCountryCity.textContent = `${stadium.country?.name || "Unknown country"} | ${stadium.city || "Unknown city"}`;
    stadiumTeams.textContent = renderTeams(stadium);
    stadiumCapacity.textContent = stadium.capacity ?? "-";

    const lat = stadium.latitude != null ? stadium.latitude : "-";
    const lng = stadium.longitude != null ? stadium.longitude : "-";
    stadiumLocation.textContent = `${lat}, ${lng}`;

    const avg = Number(insights?.averageRating || 0);
    const count = insights?.ratingCount || 0;
    stadiumRating.textContent = `Ortalama puan: ${avg.toFixed(1)} (${count} puan)`;

    stadiumComments.innerHTML = "";
    const comments = Array.isArray(insights?.comments) ? insights.comments : [];
    if (comments.length === 0) {
        stadiumComments.innerHTML = '<div class="empty">Henuz yorum yok.</div>';
    } else {
        comments.forEach((comment) => stadiumComments.appendChild(renderCommentItem(comment)));
    }

    stadiumDetailCard.classList.remove("hidden");
    stadiumDetailError.classList.add("hidden");
}

function showError() {
    stadiumDetailCard.classList.add("hidden");
    stadiumDetailError.classList.remove("hidden");
}

async function fetchJsonOrNull(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch {
        return null;
    }
}

async function loadStadiumDetail() {
    const slug = new URLSearchParams(window.location.search).get("stadiumSlug");
    if (!slug) {
        showError();
        return;
    }

    const stadium = await fetchJsonOrNull(`/api/stadiums/by-slug/${encodeURIComponent(slug)}`);
    if (!stadium?.id) {
        showError();
        return;
    }

    const insights = await fetchJsonOrNull(`/api/stadiums/${stadium.id}/insights`);
    renderStadium(stadium, insights || {});
}

loadStadiumDetail();

