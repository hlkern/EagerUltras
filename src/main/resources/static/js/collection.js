const collectionInfo = document.getElementById("collectionInfo");
const collectionList = document.getElementById("collectionList");
const teamSummaryInfo = document.getElementById("teamSummaryInfo");
const teamSummaryList = document.getElementById("teamSummaryList");
const stadiumSummaryInfo = document.getElementById("stadiumSummaryInfo");
const stadiumSummaryList = document.getElementById("stadiumSummaryList");

let collectionState = [];
let activeEditMatchId = null;

function getCurrentUserId() {
    return window.HoopAroundLayout?.user?.id ?? null;
}

function formatMatchAt(matchAt) {
    if (!matchAt) return "-";
    const dt = new Date(matchAt);
    if (Number.isNaN(dt.getTime())) return matchAt;
    return dt.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function getYear(matchAt) {
    if (!matchAt) return null;
    const dt = new Date(matchAt);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.getFullYear();
}

function createSummaryCard(titleText, count, latestYear) {
    const card = document.createElement("article");
    card.className = "stadium-card-item";

    const title = document.createElement("h4");
    title.textContent = titleText;

    const line1 = document.createElement("p");
    line1.className = "stadium-card-meta";
    line1.textContent = `${count} visits`;

    const line2 = document.createElement("p");
    line2.className = "stadium-card-meta";
    line2.textContent = `Latest visit year: ${latestYear ?? "-"}`;

    card.append(title, line1, line2);
    return card;
}

function closeEditModal() {
    const overlay = document.getElementById("matchEditOverlay");
    if (overlay) {
        overlay.remove();
    }
    activeEditMatchId = null;
}

function openEditModal(match) {
    closeEditModal();

    const overlay = document.createElement("div");
    overlay.id = "matchEditOverlay";
    overlay.className = "match-edit-overlay";

    const modal = document.createElement("div");
    modal.className = "match-edit-modal";

    const title = document.createElement("h4");
    title.textContent = `${match.homeTeam?.name || "Home"} vs ${match.awayTeam?.name || "Away"}`;

    const sub = document.createElement("p");
    sub.className = "stadium-card-meta";
    sub.textContent = `${match.stadium?.name || "Unknown stadium"} | ${formatMatchAt(match.matchAt)}`;

    const form = document.createElement("form");
    form.className = "match-edit-form";

    const ratingLabel = document.createElement("label");
    ratingLabel.textContent = "Stadium rating (1-10)";
    const ratingInput = document.createElement("input");
    ratingInput.type = "number";
    ratingInput.min = "1";
    ratingInput.max = "10";
    ratingInput.value = match.stadiumRating ?? "";
    ratingLabel.appendChild(ratingInput);

    const commentLabel = document.createElement("label");
    commentLabel.textContent = "Comment";
    const commentInput = document.createElement("textarea");
    commentInput.rows = 4;
    commentInput.value = match.comment || "";
    commentLabel.appendChild(commentInput);

    const status = document.createElement("p");
    status.className = "stadium-card-meta";

    const actions = document.createElement("div");
    actions.className = "match-actions";

    const saveBtn = document.createElement("button");
    saveBtn.className = "ghost";
    saveBtn.type = "submit";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "ghost";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";

    actions.append(saveBtn, cancelBtn);
    form.append(ratingLabel, commentLabel, actions, status);
    modal.append(title, sub, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    activeEditMatchId = match.id;

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeEditModal();
        }
    });

    cancelBtn.addEventListener("click", () => {
        closeEditModal();
    });

    document.addEventListener("keydown", function onEsc(event) {
        if (event.key === "Escape" && activeEditMatchId === match.id) {
            closeEditModal();
            document.removeEventListener("keydown", onEsc);
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = getCurrentUserId();
        if (!userId) {
            status.textContent = "User information could not be found.";
            return;
        }

        const ratingValue = ratingInput.value.trim();
        let stadiumRating = null;
        if (ratingValue) {
            stadiumRating = Number.parseInt(ratingValue, 10);
            if (Number.isNaN(stadiumRating) || stadiumRating < 1 || stadiumRating > 10) {
                status.textContent = "Rating must be between 1 and 10.";
                return;
            }
        }

        const payload = {
            stadiumRating,
            comment: commentInput.value.trim() || null
        };

        saveBtn.disabled = true;
        try {
            const response = await fetch(`/api/users/${userId}/matches/${match.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                status.textContent = data?.message || data?.error || "The match could not be updated.";
                return;
            }

            collectionState = collectionState.map((item) => (item.id === match.id ? data : item));
            renderCollection(collectionState);
            closeEditModal();
        } catch (error) {
            status.textContent = error.message || "The match could not be updated.";
        } finally {
            saveBtn.disabled = false;
        }
    });
}

function createMatchCard(match) {
    const card = document.createElement("article");
    card.className = "stadium-card-item";

    const title = document.createElement("h4");
    title.textContent = `${match.homeTeam?.name || "Home"} vs ${match.awayTeam?.name || "Away"}`;

    const line1 = document.createElement("p");
    line1.className = "stadium-card-meta";
    line1.textContent = `${match.stadium?.name || "Unknown stadium"} | ${match.stadium?.city || "City unknown"}`;

    const line2 = document.createElement("p");
    line2.className = "stadium-card-meta";
    line2.textContent = `Date: ${formatMatchAt(match.matchAt)}`;

    const line3 = document.createElement("p");
    line3.className = "stadium-card-meta";
    line3.textContent = `Rating: ${match.stadiumRating ?? "-"}`;

    const line4 = document.createElement("p");
    line4.className = "stadium-card-meta";
    line4.textContent = `Comment: ${match.comment || "-"}`;

    const status = document.createElement("p");
    status.className = "stadium-card-meta";

    const actionRow = document.createElement("div");
    actionRow.className = "match-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "ghost";
    editBtn.type = "button";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "ghost";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";

    actionRow.append(editBtn, deleteBtn);

    editBtn.addEventListener("click", () => {
        openEditModal(match);
        status.textContent = "";
    });

    deleteBtn.addEventListener("click", async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            status.textContent = "User information could not be found.";
            return;
        }

        if (!window.confirm("Do you want to delete this match from your collection?")) {
            return;
        }

        deleteBtn.disabled = true;
        try {
            const response = await fetch(`/api/users/${userId}/matches/${match.id}`, { method: "DELETE" });
            if (!response.ok && response.status !== 204) {
                const payload = await response.json().catch(() => null);
                status.textContent = payload?.message || payload?.error || "The match could not be deleted.";
                return;
            }

            collectionState = collectionState.filter((item) => item.id !== match.id);
            renderCollection(collectionState);
        } catch (error) {
            status.textContent = error.message || "The match could not be deleted.";
        } finally {
            deleteBtn.disabled = false;
        }
    });

    card.append(title, line1, line2, line3, line4, actionRow, status);
    return card;
}

function renderTeamSummary(matches) {
    if (!teamSummaryInfo || !teamSummaryList) return;

    const summary = new Map();

    matches.forEach((match) => {
        const year = getYear(match.matchAt);
        const teams = [match.homeTeam, match.awayTeam];

        teams.forEach((team) => {
            if (!team?.id) return;

            const item = summary.get(team.id) || {
                name: team.name || `Team #${team.id}`,
                count: 0,
                latestYear: null
            };

            item.count += 1;
            if (year && (!item.latestYear || year > item.latestYear)) {
                item.latestYear = year;
            }

            summary.set(team.id, item);
        });
    });

    const rows = Array.from(summary.values()).toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    teamSummaryList.innerHTML = "";
    if (rows.length === 0) {
        teamSummaryInfo.textContent = "No team summary yet.";
        return;
    }

    teamSummaryInfo.textContent = `${rows.length} teams found.`;
    rows.forEach((row) => teamSummaryList.appendChild(createSummaryCard(row.name, row.count, row.latestYear)));
}

function renderStadiumSummary(matches) {
    if (!stadiumSummaryInfo || !stadiumSummaryList) return;

    const summary = new Map();

    matches.forEach((match) => {
        const stadium = match.stadium;
        if (!stadium?.id) return;

        const year = getYear(match.matchAt);
        const item = summary.get(stadium.id) || {
            name: stadium.name || `Stadium #${stadium.id}`,
            count: 0,
            latestYear: null
        };

        item.count += 1;
        if (year && (!item.latestYear || year > item.latestYear)) {
            item.latestYear = year;
        }

        summary.set(stadium.id, item);
    });

    const rows = Array.from(summary.values()).toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    stadiumSummaryList.innerHTML = "";
    if (rows.length === 0) {
        stadiumSummaryInfo.textContent = "No stadium summary yet.";
        return;
    }

    stadiumSummaryInfo.textContent = `${rows.length} stadiums found.`;
    rows.forEach((row) => stadiumSummaryList.appendChild(createSummaryCard(row.name, row.count, row.latestYear)));
}

function renderCollection(matches) {
    if (!collectionInfo || !collectionList) return;

    collectionList.innerHTML = "";

    if (!Array.isArray(matches) || matches.length === 0) {
        collectionInfo.textContent = "Your match collection is empty.";
        if (teamSummaryInfo) teamSummaryInfo.textContent = "No team summary.";
        if (stadiumSummaryInfo) stadiumSummaryInfo.textContent = "No stadium summary.";
        if (teamSummaryList) teamSummaryList.innerHTML = "";
        if (stadiumSummaryList) stadiumSummaryList.innerHTML = "";
        return;
    }

    collectionInfo.textContent = `${matches.length} matches listed.`;
    matches.forEach((match) => collectionList.appendChild(createMatchCard(match)));

    renderTeamSummary(matches);
    renderStadiumSummary(matches);
}

async function loadCollection() {
    if (!collectionList || !collectionInfo) return;

    const userId = getCurrentUserId();
    if (!userId) {
        collectionInfo.textContent = "User information could not be found.";
        if (teamSummaryInfo) teamSummaryInfo.textContent = "User information could not be found.";
        if (stadiumSummaryInfo) stadiumSummaryInfo.textContent = "User information could not be found.";
        return;
    }

    collectionInfo.textContent = "Loading...";
    if (teamSummaryInfo) teamSummaryInfo.textContent = "Loading...";
    if (stadiumSummaryInfo) stadiumSummaryInfo.textContent = "Loading...";

    try {
        const response = await fetch(`/api/users/${userId}/matches`);
        const data = await response.json();

        if (!response.ok) {
            const message = data?.message || data?.error || "The match collection could not be loaded.";
            collectionInfo.textContent = message;
            if (teamSummaryInfo) teamSummaryInfo.textContent = message;
            if (stadiumSummaryInfo) stadiumSummaryInfo.textContent = message;
            return;
        }

        collectionState = Array.isArray(data) ? data : [];
        renderCollection(collectionState);
    } catch (error) {
        const message = error.message || "The match collection could not be loaded.";
        collectionInfo.textContent = message;
        if (teamSummaryInfo) teamSummaryInfo.textContent = message;
        if (stadiumSummaryInfo) stadiumSummaryInfo.textContent = message;
    }
}

if (window.HoopAroundLayout?.user) {
    loadCollection();
}
