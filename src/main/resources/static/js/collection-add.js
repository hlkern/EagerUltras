const matchForm = document.getElementById("matchForm");
const matchStadiumInput = document.getElementById("matchStadiumInput");
const matchStadiumResults = document.getElementById("matchStadiumResults");
const matchHomeTeamInput = document.getElementById("matchHomeTeamInput");
const matchHomeTeamResults = document.getElementById("matchHomeTeamResults");
const matchAwayTeamInput = document.getElementById("matchAwayTeamInput");
const matchAwayTeamResults = document.getElementById("matchAwayTeamResults");
const matchAt = document.getElementById("matchAt");
const matchRating = document.getElementById("matchRating");
const matchComment = document.getElementById("matchComment");
const matchFormInfo = document.getElementById("matchFormInfo");
const matchSubmitBtn = document.getElementById("matchSubmitBtn");

let stadiumIndex = new Map();
let allTeams = [];
let selectedStadium = null;
let selectedHomeTeam = null;
let selectedAwayTeam = null;

function hideResults(resultsEl) {
    if (!resultsEl) return;
    resultsEl.innerHTML = "";
    resultsEl.classList.add("hidden");
}

function buildOptionButton(label, metaText, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-item";

    const title = document.createElement("strong");
    title.textContent = label;

    const meta = document.createElement("span");
    meta.className = "search-result-meta";
    meta.textContent = metaText;

    button.append(title, meta);
    button.addEventListener("click", onClick);
    return button;
}

function renderPickerResults(resultsEl, items, buildItem) {
    if (!resultsEl) return;
    resultsEl.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        resultsEl.innerHTML = '<div class="empty">No matches found.</div>';
        resultsEl.classList.remove("hidden");
        return;
    }

    items.forEach((item) => resultsEl.appendChild(buildItem(item)));
    resultsEl.classList.remove("hidden");
}

function getHomeTeamOptions() {
    return selectedStadium?.teams?.toSorted((a, b) => (a.name || "").localeCompare(b.name || "")) || [];
}

function getAwayTeamOptions() {
    return allTeams
        .filter((team) => team.id !== selectedHomeTeam?.id)
        .toSorted((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function resetHomeTeam() {
    selectedHomeTeam = null;
    if (matchHomeTeamInput) {
        matchHomeTeamInput.value = "";
    }
    hideResults(matchHomeTeamResults);
}

function resetAwayTeam() {
    selectedAwayTeam = null;
    if (matchAwayTeamInput) {
        matchAwayTeamInput.value = "";
    }
    hideResults(matchAwayTeamResults);
}

function selectStadium(stadium) {
    selectedStadium = stadium || null;
    if (matchStadiumInput) {
        matchStadiumInput.value = stadium ? stadium.name || "" : "";
    }
    hideResults(matchStadiumResults);
    resetHomeTeam();
    resetAwayTeam();
    if (matchFormInfo?.textContent === "Choose a stadium first.") {
        matchFormInfo.textContent = "";
    }
}

function selectHomeTeam(team) {
    selectedHomeTeam = team || null;
    if (matchHomeTeamInput) {
        matchHomeTeamInput.value = team ? team.name || "" : "";
    }
    hideResults(matchHomeTeamResults);
    if (selectedAwayTeam?.id === team?.id) {
        resetAwayTeam();
    }
    if (matchFormInfo?.textContent === "Choose the home team first.") {
        matchFormInfo.textContent = "";
    }
}

function selectAwayTeam(team) {
    selectedAwayTeam = team || null;
    if (matchAwayTeamInput) {
        matchAwayTeamInput.value = team ? team.name || "" : "";
    }
    hideResults(matchAwayTeamResults);
}

function searchStadiums(query) {
    const normalized = String(query || "").trim().toLocaleLowerCase("en-US");
    const stadiums = Array.from(stadiumIndex.values())
        .toSorted((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (!normalized) {
        return stadiums.slice(0, 8);
    }

    return stadiums
        .filter((stadium) => `${stadium.name || ""} ${stadium.city || ""}`.toLocaleLowerCase("en-US").includes(normalized))
        .slice(0, 8);
}

function searchTeams(teams, query) {
    const normalized = String(query || "").trim().toLocaleLowerCase("en-US");

    if (!normalized) {
        return teams.slice(0, 8);
    }

    return teams
        .filter((team) => String(team.name || "").toLocaleLowerCase("en-US").includes(normalized))
        .slice(0, 8);
}

function showStadiumResults(query = "") {
    const results = searchStadiums(query);
    renderPickerResults(matchStadiumResults, results, (stadium) =>
        buildOptionButton(
            stadium.name || `Stadium #${stadium.id}`,
            stadium.city || "Unknown city",
            () => selectStadium(stadium)
        )
    );
}

function showHomeTeamResults(query = "") {
    if (!selectedStadium) {
        if (matchFormInfo) {
            matchFormInfo.textContent = "Choose a stadium first.";
        }
        hideResults(matchHomeTeamResults);
        return;
    }

    const results = searchTeams(getHomeTeamOptions(), query);
    renderPickerResults(matchHomeTeamResults, results, (team) =>
        buildOptionButton(team.name || `Team #${team.id}`, selectedStadium.name || "Stadium team", () => selectHomeTeam(team))
    );
}

function showAwayTeamResults(query = "") {
    if (!selectedHomeTeam) {
        if (matchFormInfo) {
            matchFormInfo.textContent = "Choose the home team first.";
        }
        hideResults(matchAwayTeamResults);
        return;
    }

    const results = searchTeams(getAwayTeamOptions(), query);
    renderPickerResults(matchAwayTeamResults, results, (team) =>
        buildOptionButton(team.name || `Team #${team.id}`, "Available away team", () => selectAwayTeam(team))
    );
}

async function loadAllTeams() {
    try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
            allTeams = data.toSorted((a, b) => (a.name || "").localeCompare(b.name || ""));
        }
    } catch {
        allTeams = [];
    }
}

async function initMatchForm(stadiums) {
    if (!matchForm || !matchStadiumInput) return;

    stadiumIndex = new Map((stadiums || []).map((stadium) => [stadium.id, stadium]));
    await loadAllTeams();

    matchStadiumInput.addEventListener("focus", () => showStadiumResults(matchStadiumInput.value));
    matchStadiumInput.addEventListener("input", () => {
        selectedStadium = null;
        resetHomeTeam();
        resetAwayTeam();
        showStadiumResults(matchStadiumInput.value);
    });

    matchHomeTeamInput?.addEventListener("focus", () => showHomeTeamResults(matchHomeTeamInput.value));
    matchHomeTeamInput?.addEventListener("input", () => {
        selectedHomeTeam = null;
        resetAwayTeam();
        showHomeTeamResults(matchHomeTeamInput.value);
    });

    matchAwayTeamInput?.addEventListener("focus", () => showAwayTeamResults(matchAwayTeamInput.value));
    matchAwayTeamInput?.addEventListener("input", () => {
        selectedAwayTeam = null;
        showAwayTeamResults(matchAwayTeamInput.value);
    });

    document.addEventListener("click", (event) => {
        if (!matchStadiumInput?.closest("label")?.contains(event.target)) {
            hideResults(matchStadiumResults);
        }
        if (!matchHomeTeamInput?.closest("label")?.contains(event.target)) {
            hideResults(matchHomeTeamResults);
        }
        if (!matchAwayTeamInput?.closest("label")?.contains(event.target)) {
            hideResults(matchAwayTeamResults);
        }
    });

    matchForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = window.HoopAroundLayout?.user?.id;
        if (!userId) {
            if (matchFormInfo) matchFormInfo.textContent = "User information could not be found.";
            return;
        }

        const payload = {
            stadiumId: Number(selectedStadium?.id || 0),
            homeTeamId: Number(selectedHomeTeam?.id || 0),
            awayTeamId: Number(selectedAwayTeam?.id || 0),
            matchAt: matchAt.value ? `${matchAt.value}T12:00:00` : "",
            stadiumRating: matchRating.value ? Number(matchRating.value) : null,
            comment: matchComment.value || null
        };

        if (!payload.stadiumId || !payload.homeTeamId || !payload.awayTeamId || !payload.matchAt) {
            if (matchFormInfo) matchFormInfo.textContent = "Please fill in the required fields.";
            return;
        }

        if (payload.homeTeamId === payload.awayTeamId) {
            if (matchFormInfo) matchFormInfo.textContent = "Home and away teams must be different.";
            return;
        }

        try {
            if (matchSubmitBtn) matchSubmitBtn.disabled = true;

            const response = await fetch(`/api/users/${userId}/matches`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                if (matchFormInfo) {
                    matchFormInfo.textContent = body?.message || body?.error || "The match could not be added to your collection.";
                }
                return;
            }

            if (matchFormInfo) matchFormInfo.textContent = "Match added to your collection!";
            matchForm.reset();
            selectedStadium = null;
            resetHomeTeam();
            resetAwayTeam();
            hideResults(matchStadiumResults);
            if (matchStadiumInput) {
                matchStadiumInput.value = "";
            }
        } catch (error) {
            if (matchFormInfo) matchFormInfo.textContent = error.message || "The match could not be added to your collection.";
        } finally {
            if (matchSubmitBtn) matchSubmitBtn.disabled = false;
        }
    });
}

async function loadStadiums() {
    if (matchFormInfo) matchFormInfo.textContent = "Loading stadiums...";
    try {
        const response = await fetch("/api/stadiums");
        const data = await response.json();
        if (!response.ok || !Array.isArray(data) || data.length === 0) {
            if (matchFormInfo) matchFormInfo.textContent = "Stadium data could not be loaded.";
            return;
        }
        if (matchFormInfo) matchFormInfo.textContent = "";
        await initMatchForm(data);
    } catch {
        if (matchFormInfo) matchFormInfo.textContent = "Stadium data could not be loaded.";
    }
}

if (window.HoopAroundLayout?.user) {
    loadStadiums();
}
