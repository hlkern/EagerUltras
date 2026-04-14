const stadiumsList = document.getElementById("stadiumsList");
const stadiumsInfo = document.getElementById("stadiumsInfo");
const filterButtons = document.querySelectorAll(".filter-btn");
const visitedStadiumIds = new Set();
const wishlistStadiumIds = new Set();

const requestedStadiumSlug = new URLSearchParams(window.location.search).get("stadiumSlug");

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

let allStadiums = [];
let currentFilter = "all";

function getCurrentUserId() {
    return window.HoopAroundLayout?.user?.id ?? null;
}

function renderTeams(stadium) {
    const names = (stadium.teams || []).map((team) => team?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "Team unknown";
}

async function loadVisitedStadiumIds(userId) {
    if (!userId) return;

    try {
        const response = await fetch(`/api/users/${userId}/stadiums`);
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
            return;
        }

        data.forEach((stadium) => {
            if (stadium?.id != null) {
                visitedStadiumIds.add(stadium.id);
            }
        });
    } catch {
        // Keep default empty state; action buttons stay enabled.
    }
}

async function loadWishlistStadiumIds(userId) {
    if (!userId) return;

    try {
        const response = await fetch(`/api/users/${userId}/wishlist`);
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
            return;
        }

        data.forEach((stadium) => {
            if (stadium?.id != null) {
                wishlistStadiumIds.add(stadium.id);
            }
        });
    } catch {
        // Keep default empty state.
    }
}

function updateInfoText(totalCount, renderedCount) {
    if (!stadiumsInfo) return;

    const visitedCount = visitedStadiumIds.size;
    let filterLabel = "All";
    if (currentFilter === "visited") {
        filterLabel = "Visited";
    } else if (currentFilter === "not_visited") {
        filterLabel = "Not Visited";
    }

    stadiumsInfo.textContent = `${totalCount} stadyum, ${visitedCount} tanesi koleksiyonunda. Gosterilen: ${renderedCount} (${filterLabel}).`;
}

function applyFilter(stadiums) {
    if (currentFilter === "visited") {
        return stadiums.filter((stadium) => visitedStadiumIds.has(stadium.id));
    }
    if (currentFilter === "not_visited") {
        return stadiums.filter((stadium) => !visitedStadiumIds.has(stadium.id));
    }
    return stadiums;
}

function refreshStadiumList() {
    if (!stadiumsList) return;

    const filtered = applyFilter(allStadiums);
    stadiumsList.innerHTML = "";

    if (filtered.length === 0) {
        stadiumsList.innerHTML = '<div class="empty">Bu filtrede stadyum bulunamadi.</div>';
        updateInfoText(allStadiums.length, 0);
        return;
    }

    filtered.forEach((stadium) => stadiumsList.appendChild(createStadiumCard(stadium)));
    updateInfoText(allStadiums.length, filtered.length);
}

function setFilter(nextFilter) {
    currentFilter = nextFilter;
    filterButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.filter === nextFilter);
    });
    refreshStadiumList();
}

function createWishlistButton(stadiumId) {
    const btn = document.createElement("button");
    btn.className = "ghost";
    btn.type = "button";

    function syncButtonState() {
        if (wishlistStadiumIds.has(stadiumId)) {
            btn.textContent = "Remove Wishlist";
        } else {
            btn.textContent = "Add Wishlist";
        }
    }

    syncButtonState();

    btn.addEventListener("click", async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            if (stadiumsInfo) stadiumsInfo.textContent = "Kullanici bilgisi bulunamadi.";
            return;
        }

        const alreadyInWishlist = wishlistStadiumIds.has(stadiumId);

        try {
            const response = await fetch(`/api/user-wishlist/${userId}/${stadiumId}`, {
                method: alreadyInWishlist ? "DELETE" : "POST"
            });

            if (response.status === 204 || response.ok) {
                if (alreadyInWishlist) {
                    wishlistStadiumIds.delete(stadiumId);
                    if (stadiumsInfo) stadiumsInfo.textContent = "Stadyum wishlist'ten cikarildi.";
                } else {
                    wishlistStadiumIds.add(stadiumId);
                    if (stadiumsInfo) stadiumsInfo.textContent = "Stadyum wishlist'e eklendi.";
                }
                syncButtonState();
                return;
            }

            const payload = await response.json().catch(() => null);
            if (response.status === 409) {
                wishlistStadiumIds.add(stadiumId);
                syncButtonState();
                if (stadiumsInfo) stadiumsInfo.textContent = payload?.message || "Bu stadyum wishlist'te zaten var.";
                return;
            }

            if (response.status === 404 && alreadyInWishlist) {
                wishlistStadiumIds.delete(stadiumId);
                syncButtonState();
                if (stadiumsInfo) stadiumsInfo.textContent = "Stadyum zaten wishlistte degildi.";
                return;
            }

            if (stadiumsInfo) stadiumsInfo.textContent = payload?.message || payload?.error || "Wishlist islemi basarisiz.";
        } catch (error) {
            if (stadiumsInfo) stadiumsInfo.textContent = error.message || "Wishlist islemi basarisiz.";
        }
    });

    return btn;
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

async function fetchStadiumInsights(stadiumId) {
    try {
        const response = await fetch(`/api/stadiums/${stadiumId}/insights`);
        const data = await response.json();
        if (!response.ok) {
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function createCommentItem(comment) {
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

function createInsightsSection(stadiumId) {
    const wrapper = document.createElement("div");
    wrapper.className = "stadium-insights hidden";

    const rating = document.createElement("p");
    rating.className = "stadium-card-meta";
    rating.textContent = "Ortalama puan: -";

    const title = document.createElement("h5");
    title.textContent = "Yorumlar";

    const comments = document.createElement("div");
    comments.className = "stadium-comments";
    comments.innerHTML = '<div class="empty">Yukleniyor...</div>';

    wrapper.append(rating, title, comments);

    let loaded = false;

    async function ensureLoaded() {
        if (loaded) return;

        const insights = await fetchStadiumInsights(stadiumId);
        if (!insights) {
            comments.innerHTML = '<div class="error">Yorumlar yuklenemedi.</div>';
            loaded = true;
            return;
        }

        const avg = Number(insights.averageRating || 0);
        const count = insights.ratingCount || 0;
        rating.textContent = `Ortalama puan: ${avg.toFixed(1)} (${count} puan)`;

        const list = Array.isArray(insights.comments) ? insights.comments : [];
        comments.innerHTML = "";
        if (list.length === 0) {
            comments.innerHTML = '<div class="empty">Henuz yorum yok.</div>';
        } else {
            list.forEach((comment) => comments.appendChild(createCommentItem(comment)));
        }

        loaded = true;
    }

    return {
        element: wrapper,
        async toggle() {
            const shouldOpen = wrapper.classList.contains("hidden");
            if (shouldOpen) {
                await ensureLoaded();
                wrapper.classList.remove("hidden");
            } else {
                wrapper.classList.add("hidden");
            }
        }
    };
}

function createStadiumCard(stadium) {
    const card = document.createElement("article");
    card.className = "stadium-card-item";

    const titleRow = document.createElement("div");
    titleRow.className = "stadium-title-row";

    const title = document.createElement("h4");
    title.textContent = stadium.name || "Unnamed stadium";

    titleRow.appendChild(title);

    const isVisited = visitedStadiumIds.has(stadium.id);
    const badge = document.createElement("span");
    badge.className = `stadium-badge ${isVisited ? "stadium-badge--visited" : "stadium-badge--not-visited"}`;
    badge.textContent = isVisited ? "Gidildi" : "Gidilmedi";
    titleRow.appendChild(badge);

    const line1 = document.createElement("p");
    line1.className = "stadium-card-meta";
    line1.textContent = `${stadium.country?.name || "Unknown country"} | ${stadium.city || "City unknown"}`;

    const line2 = document.createElement("p");
    line2.className = "stadium-card-meta";
    line2.textContent = `Teams: ${renderTeams(stadium)}`;

    const line3 = document.createElement("p");
    line3.className = "stadium-card-meta";
    line3.textContent = `Capacity: ${stadium.capacity ?? "-"}`;

    const wishlistButton = createWishlistButton(stadium.id);
    const insights = createInsightsSection(stadium.id);

    titleRow.addEventListener("click", async (event) => {
        event.preventDefault();
        await insights.toggle();
    });

    card.append(titleRow, line1, line2, line3, wishlistButton, insights.element);

    if (requestedStadiumSlug && toSlug(stadium.name) === requestedStadiumSlug) {
        card.classList.add("stadium-card-highlight");
        setTimeout(async () => {
            await insights.toggle();
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 0);
    }

    return card;
}

async function loadStadiums() {
    if (!stadiumsList) return;

    stadiumsList.innerHTML = '<div class="empty">Loading stadiums...</div>';

    try {
        const userId = getCurrentUserId();
        await loadVisitedStadiumIds(userId);
        await loadWishlistStadiumIds(userId);

        const response = await fetch("/api/stadiums");
        const data = await response.json();

        if (!response.ok) {
            stadiumsList.innerHTML = `<div class="error">${data?.message || data?.error || "Could not load stadiums."}</div>`;
            if (stadiumsInfo) stadiumsInfo.textContent = "";
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            stadiumsList.innerHTML = '<div class="empty">No stadiums found.</div>';
            if (stadiumsInfo) stadiumsInfo.textContent = "";
            return;
        }

        allStadiums = data.toSorted((a, b) => (a.name || "").localeCompare(b.name || ""));
        refreshStadiumList();
    } catch (error) {
        stadiumsList.innerHTML = `<div class="error">${error.message || "Unexpected error"}</div>`;
        if (stadiumsInfo) stadiumsInfo.textContent = "";
    }
}

if (filterButtons.length > 0) {
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => setFilter(btn.dataset.filter || "all"));
    });
}

if (window.HoopAroundLayout?.user) {
    loadStadiums();
}
