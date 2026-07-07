const matchForm = document.getElementById("matchForm");
const matchStadiumId = document.getElementById("matchStadiumId");
const matchHomeTeamId = document.getElementById("matchHomeTeamId");
const matchAwayTeamId = document.getElementById("matchAwayTeamId");
const matchAt = document.getElementById("matchAt");
const matchRating = document.getElementById("matchRating");
const matchComment = document.getElementById("matchComment");
const matchFormInfo = document.getElementById("matchFormInfo");
const matchSubmitBtn = document.getElementById("matchSubmitBtn");

let stadiumIndex = new Map();
let allTeams = [];

function fillTeamSelect(selectEl, teams, placeholderText) {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">${placeholderText || "Select team"}</option>`;
    (teams || []).forEach((team) => {
        const option = document.createElement("option");
        option.value = String(team.id);
        option.textContent = team.name || `Team #${team.id}`;
        selectEl.appendChild(option);
    });
}

function updateAwayTeams() {
    const homeTeamId = Number(matchHomeTeamId?.value || 0);
    const awayCandidates = allTeams.filter((team) => team.id !== homeTeamId);
    fillTeamSelect(matchAwayTeamId, awayCandidates, "Select away team");
}

function onStadiumChanged() {
    const stadiumId = Number(matchStadiumId?.value || 0);
    const selectedStadium = stadiumIndex.get(stadiumId);
    const teams = selectedStadium?.teams || [];
    fillTeamSelect(matchHomeTeamId, teams, "Select home team");
    updateAwayTeams();
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
    if (!matchForm || !matchStadiumId) return;

    stadiumIndex = new Map((stadiums || []).map((s) => [s.id, s]));
    matchStadiumId.innerHTML = '<option value="">Select stadium</option>';

    stadiums
        .toSorted((a, b) => (a.name || "").localeCompare(b.name || ""))
        .forEach((stadium) => {
            const option = document.createElement("option");
            option.value = String(stadium.id);
            option.textContent = `${stadium.name} (${stadium.city || "Unknown city"})`;
            matchStadiumId.appendChild(option);
        });

    await loadAllTeams();

    fillTeamSelect(matchHomeTeamId, [], "Select home team");
    fillTeamSelect(matchAwayTeamId, allTeams, "Select away team");

    matchStadiumId.addEventListener("change", onStadiumChanged);
    matchHomeTeamId?.addEventListener("change", updateAwayTeams);

    matchForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = window.HoopAroundLayout?.user?.id;
        if (!userId) {
            if (matchFormInfo) matchFormInfo.textContent = "User information could not be found.";
            return;
        }

        const payload = {
            stadiumId: Number(matchStadiumId.value),
            homeTeamId: Number(matchHomeTeamId.value),
            awayTeamId: Number(matchAwayTeamId.value),
            matchAt: matchAt.value,
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
            fillTeamSelect(matchHomeTeamId, [], "Select home team");
            fillTeamSelect(matchAwayTeamId, allTeams, "Select away team");
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
