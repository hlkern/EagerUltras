const map = L.map("map").setView([39.5, 35.0], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

const mapInfo = document.getElementById("mapInfo");

const COLORS = {
    visited:  { fill: "#ff7a18", stroke: "#ffb347" },
    wishlist: { fill: "#7ab8ff", stroke: "#a0d0ff" },
    other:    { fill: "#4a5280", stroke: "#6370a8"  }
};

let allMarkers = [];
let activeFilter = "all";
let wishlistIds = new Set();

function markerType(stadiumId, visitedSet, wishlistSet) {
    if (visitedSet.has(stadiumId))  return "visited";
    if (wishlistSet.has(stadiumId)) return "wishlist";
    return "other";
}

function makeCircle(stadium, type) {
    if (!stadium.latitude || !stadium.longitude) return null;

    const { fill, stroke } = COLORS[type];
    const circle = L.circleMarker([stadium.latitude, stadium.longitude], {
        radius: type === "other" ? 6 : 9,
        fillColor: fill,
        color: stroke,
        weight: 2,
        opacity: 1,
        fillOpacity: type === "other" ? 0.5 : 0.9
    });

    const teams = (stadium.teams || []).map(t => t.name).filter(Boolean).join(", ") || "—";
    const badge = type === "visited"
        ? '<span style="color:#ff7a18;font-weight:700;">✔ Ziyaret edildi</span>'
        : type === "wishlist"
        ? '<span style="color:#7ab8ff;font-weight:700;">★ Wishlist</span>'
        : "";

    circle.bindPopup(`
        <div style="min-width:160px;font-family:Inter,sans-serif;font-size:13px;">
            <strong style="font-size:14px;cursor:pointer;text-decoration:underline;color:#fff;"
                    onclick="openStadiumModal(${stadium.id})">${stadium.name || "Stadyum"}</strong><br/>
            <span style="color:#888;">${stadium.city || ""} ${stadium.country?.name ? "· " + stadium.country.name : ""}</span><br/>
            <span style="color:#888;">Kapasite: ${stadium.capacity ?? "—"}</span><br/>
            <span style="color:#888;">${teams}</span><br/>
            ${badge ? "<br/>" + badge : ""}
            <br/><span style="font-size:11px;color:#7ab8ff;cursor:pointer;" onclick="openStadiumModal(${stadium.id})">→ Stadyum sayfasını aç</span>
        </div>
    `);

    return circle;
}

function applyFilter(filter) {
    activeFilter = filter;
    allMarkers.forEach(({ circle, type }) => {
        if (filter === "all" || filter === type) {
            map.addLayer(circle);
        } else {
            map.removeLayer(circle);
        }
    });

    document.querySelectorAll(".map-filter-row .filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filter);
    });
}

async function loadMap() {
    const userId = window.HoopAroundLayout?.user?.id;
    if (!userId) return;

    if (mapInfo) mapInfo.textContent = "Harita yukleniyor...";

    try {
        const [stadiumsResp, visitedResp, wishlistResp] = await Promise.all([
            fetch("/api/stadiums"),
            fetch(`/api/users/${userId}/stadiums`),
            fetch(`/api/users/${userId}/wishlist`)
        ]);

        const stadiums = stadiumsResp.ok ? await stadiumsResp.json() : [];
        const visited  = visitedResp.ok  ? await visitedResp.json()  : [];
        const wishlist = wishlistResp.ok  ? await wishlistResp.json() : [];

        const visitedIds = new Set((Array.isArray(visited)  ? visited  : []).map(s => s.id));
        wishlistIds      = new Set((Array.isArray(wishlist) ? wishlist : []).map(s => s.id));

        const validStadiums = (Array.isArray(stadiums) ? stadiums : [])
            .filter(s => s.latitude && s.longitude);

        allMarkers = validStadiums.map(stadium => {
            const type = markerType(stadium.id, visitedIds, wishlistIds);
            const circle = makeCircle(stadium, type);
            if (circle) circle.addTo(map);
            return { circle, type, stadium };
        }).filter(m => m.circle);

        const visitedCount  = allMarkers.filter(m => m.type === "visited").length;
        const wishlistCount = allMarkers.filter(m => m.type === "wishlist").length;
        const totalCount    = allMarkers.length;

        if (mapInfo) {
            mapInfo.textContent = `${totalCount} stadyum haritada · ${visitedCount} ziyaret edildi · ${wishlistCount} wishlist'te`;
        }

        // Bring visited + wishlist to front
        allMarkers
            .filter(m => m.type !== "other")
            .forEach(m => m.circle.bringToFront());

    } catch (err) {
        if (mapInfo) mapInfo.textContent = "Harita yuklenemedi.";
    }
}

// Filter buttons
document.querySelectorAll(".map-filter-row .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
});

if (window.HoopAroundLayout?.user) {
    loadMap();
}

// ── Stadium detail modal ──────────────────────────────────────────────────────

function openStadiumModal(stadiumId) {
    const overlay = document.getElementById("stadiumModalOverlay");
    const content = document.getElementById("smContent");
    content.innerHTML = '<p style="color:var(--muted,#888);text-align:center;padding:30px 0;">Yükleniyor…</p>';
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    loadStadiumModalData(stadiumId);
}

function closeStadiumModal() {
    document.getElementById("stadiumModalOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

async function loadStadiumModalData(stadiumId) {
    const content = document.getElementById("smContent");
    const userId  = window.HoopAroundLayout?.user?.id;

    try {
        const [stadResp, insightsResp] = await Promise.all([
            fetch(`/api/stadiums/${stadiumId}`),
            fetch(`/api/stadiums/${stadiumId}/insights${userId ? "?viewerUserId=" + userId : ""}`)
        ]);
        const stadium  = stadResp.ok  ? await stadResp.json()     : null;
        const insights = insightsResp.ok ? await insightsResp.json() : {};

        if (!stadium) {
            content.innerHTML = '<p style="color:#f87;text-align:center;padding:20px 0;">Stadyum bulunamadı.</p>';
            return;
        }

        const marker = allMarkers.find(m => m.stadium.id === stadiumId);
        const type   = marker?.type || "other";

        const teams   = (stadium.teams || []).map(t => t.name).filter(Boolean).join(", ") || "—";
        const avg     = Number(insights?.averageRating || 0);
        const rCount  = insights?.ratingCount || 0;
        const comments = Array.isArray(insights?.comments) ? insights.comments : [];

        const statusBadge = type === "visited"
            ? '<span class="sm-status sm-status--visited">✔ Ziyaret ettim</span>'
            : type === "wishlist"
            ? '<span class="sm-status sm-status--wishlist">★ Wishlist\'imde</span>'
            : "";

        const commentsHtml = comments.length === 0
            ? '<p style="color:var(--muted,#888);font-size:13px;">Henüz yorum yok.</p>'
            : comments.map(c => `
                <div class="sm-comment-item">
                    <p class="sm-comment-text">${escHtml(c.comment || "")}</p>
                    <p class="sm-comment-meta">${escHtml(c.username || "?")} · Puan: ${c.rating ?? "—"} · ${formatDate(c.matchAt)}</p>
                </div>`).join("");

        content.innerHTML = `
            <h2>${escHtml(stadium.name || "Stadyum")}</h2>
            <p class="sm-meta">${escHtml(stadium.city || "")}${stadium.country?.name ? " · " + escHtml(stadium.country.name) : ""}</p>
            ${statusBadge}
            <div class="sm-grid">
                <div><span>Takımlar</span><strong>${escHtml(teams)}</strong></div>
                <div><span>Kapasite</span><strong>${stadium.capacity ?? "—"}</strong></div>
                <div><span>Ort. Puan</span><strong>${avg.toFixed(1)} (${rCount})</strong></div>
                <div><span>Konum</span><strong>${stadium.latitude != null ? stadium.latitude.toFixed(4) + ", " + stadium.longitude.toFixed(4) : "—"}</strong></div>
            </div>
            ${type !== "visited" ? `<div id="smWishlistRow"></div>` : ""}
            <p class="sm-comments-title">Ziyaretçi yorumları</p>
            ${commentsHtml}
            <a class="sm-full-link" href="/stadium-detail.html?stadiumId=${stadium.id}">Tam sayfada görüntüle →</a>
        `;

        if (type !== "visited") {
            renderWishlistBtn(stadiumId, type === "wishlist");
        }
    } catch (err) {
        content.innerHTML = '<p style="color:#f87;text-align:center;padding:20px 0;">Veri yüklenemedi.</p>';
    }
}

function renderWishlistBtn(stadiumId, inWishlist) {
    const row = document.getElementById("smWishlistRow");
    if (!row) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sm-wishlist-btn" + (inWishlist ? " sm-wishlist-btn--active" : "");
    btn.textContent = inWishlist ? "★ Wishlist'ten çıkar" : "☆ Wishlist'e ekle";

    btn.addEventListener("click", async () => {
        const userId = window.HoopAroundLayout?.user?.id;
        if (!userId) return;

        btn.disabled = true;
        const method = inWishlist ? "DELETE" : "POST";
        try {
            const resp = await fetch(`/api/user-wishlist/${userId}/${stadiumId}`, { method });
            if (resp.ok || resp.status === 204) {
                inWishlist = !inWishlist;

                // Update local wishlist set and marker type
                const marker = allMarkers.find(m => m.stadium.id === stadiumId);
                if (marker) {
                    if (inWishlist) {
                        wishlistIds.add(stadiumId);
                        marker.type = "wishlist";
                        marker.circle.setStyle({ fillColor: COLORS.wishlist.fill, color: COLORS.wishlist.stroke, radius: 9, fillOpacity: 0.9 });
                    } else {
                        wishlistIds.delete(stadiumId);
                        marker.type = "other";
                        marker.circle.setStyle({ fillColor: COLORS.other.fill, color: COLORS.other.stroke, radius: 6, fillOpacity: 0.5 });
                    }
                }

                btn.textContent = inWishlist ? "★ Wishlist'ten çıkar" : "☆ Wishlist'e ekle";
                btn.className   = "sm-wishlist-btn" + (inWishlist ? " sm-wishlist-btn--active" : "");
            }
        } finally {
            btn.disabled = false;
        }
    });

    row.appendChild(btn);
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatDate(value) {
    if (!value) return "—";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return dt.toLocaleString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
