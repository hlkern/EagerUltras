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

function getCurrentUserId() {
    return window.HoopAroundLayout?.user?.id ?? null;
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

function renderTeams(stadium) {
    const names = (stadium?.teams || []).map((team) => team?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "-";
}

 async function saveCommentReaction(matchId, reaction) {
    const userId = getCurrentUserId();
    if (!userId || !matchId) {
        return false;
    }

    const isRemoving = !reaction;
    const url = `/api/users/${userId}/matches/${matchId}/reaction`;
    const options = isRemoving
        ? { method: "DELETE" }
        : {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reaction })
        };

    try {
        const response = await fetch(url, options);
        return response.status === 204 || response.ok;
    } catch {
        return false;
    }
}

function createReactionBar(comment) {
    const bar = document.createElement("div");
    bar.className = "comment-reaction-row";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "comment-reaction-btn";

    const dislikeBtn = document.createElement("button");
    dislikeBtn.type = "button";
    dislikeBtn.className = "comment-reaction-btn";

    let current = comment.currentUserReaction || null;
    let likes = Number(comment.likeCount || 0);
    let dislikes = Number(comment.dislikeCount || 0);

    const sync = () => {
        likeBtn.textContent = `Like (${likes})`;
        dislikeBtn.textContent = `Dislike (${dislikes})`;
        likeBtn.classList.toggle("active", current === "LIKE");
        dislikeBtn.classList.toggle("active", current === "DISLIKE");
    };

    const onReact = async (next) => {
        const previous = current;
        const target = previous === next ? null : next;
        const changed = await saveCommentReaction(comment.matchId, target);
        if (!changed) {
            return;
        }

        if (previous === "LIKE") likes -= 1;
        if (previous === "DISLIKE") dislikes -= 1;
        if (target === "LIKE") likes += 1;
        if (target === "DISLIKE") dislikes += 1;
        current = target;
        sync();
    };

    likeBtn.addEventListener("click", () => onReact("LIKE"));
    dislikeBtn.addEventListener("click", () => onReact("DISLIKE"));

    sync();
    bar.append(likeBtn, dislikeBtn);
    return bar;
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

    if (comment.matchId) {
        item.appendChild(createReactionBar(comment));
    }

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
    const params = new URLSearchParams(window.location.search);
    const slug   = params.get("stadiumSlug");
    const idParam = params.get("stadiumId");

    let stadium = null;

    if (idParam) {
        stadium = await fetchJsonOrNull(`/api/stadiums/${encodeURIComponent(idParam)}`);
    } else if (slug) {
        stadium = await fetchJsonOrNull(`/api/stadiums/by-slug/${encodeURIComponent(slug)}`);
    }

    if (!stadium?.id) {
        showError();
        return;
    }

    const viewerUserId = getCurrentUserId();
    const query = viewerUserId ? `?viewerUserId=${encodeURIComponent(viewerUserId)}` : "";
    const insights = await fetchJsonOrNull(`/api/stadiums/${stadium.id}/insights${query}`);
    renderStadium(stadium, insights || {});
}

loadStadiumDetail();
