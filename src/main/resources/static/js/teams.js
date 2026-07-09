const teamsList = document.getElementById("teamsList");
const teamsInfo = document.getElementById("teamsInfo");
const teamSearchInput = document.getElementById("teamSearchInput");
let allTeams = [];

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function normalizeSearch(value) {
    return String(value || "")
        .toLocaleLowerCase("en-US")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function createTeamCard(team) {
    const card = document.createElement("article");
    card.className = "stadium-card-item team-card";

    const title = document.createElement("h4");
    title.textContent = team.name || "Unnamed team";

    const meta = document.createElement("p");
    meta.className = "stadium-card-meta";
    meta.textContent = "Open team detail page";

    card.append(title, meta);

    card.addEventListener("click", () => {
        if (!team?.name) return;
        window.location.href = `/takim/${toSlug(team.name)}`;
    });

    return card;
}

function renderTeams() {
    if (!teamsList) return;

    const query = normalizeSearch(teamSearchInput?.value || "");
    const filteredTeams = !query
        ? allTeams
        : allTeams.filter((team) => normalizeSearch(team.name).includes(query));

    teamsList.innerHTML = "";

    if (filteredTeams.length === 0) {
        teamsList.innerHTML = '<div class="empty">No teams matched your search.</div>';
        if (teamsInfo) teamsInfo.textContent = "";
        return;
    }

    filteredTeams.forEach((team) => teamsList.appendChild(createTeamCard(team)));
    if (teamsInfo) teamsInfo.textContent = `${filteredTeams.length} teams listed.`;
}

async function loadTeams() {
    if (!teamsList) return;

    teamsList.innerHTML = '<div class="empty">Loading teams...</div>';

    try {
        const response = await fetch("/api/teams");
        const data = await response.json();

        if (!response.ok) {
            teamsList.innerHTML = `<div class="error">${data?.message || data?.error || "Could not load teams."}</div>`;
            if (teamsInfo) teamsInfo.textContent = "";
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            teamsList.innerHTML = '<div class="empty">No teams found.</div>';
            if (teamsInfo) teamsInfo.textContent = "";
            return;
        }

        allTeams = data.toSorted((a, b) => (a.name || "").localeCompare(b.name || ""));
        renderTeams();
    } catch {
        teamsList.innerHTML = '<div class="error">Could not load teams.</div>';
        if (teamsInfo) teamsInfo.textContent = "";
    }
}

if (teamSearchInput) {
    teamSearchInput.addEventListener("input", () => {
        renderTeams();
    });
}

loadTeams();

