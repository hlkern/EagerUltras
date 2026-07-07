const teamDetailCard = document.getElementById("teamDetailCard");
const teamDetailError = document.getElementById("teamDetailError");
const teamPageTitle = document.getElementById("teamPageTitle");
const teamName = document.getElementById("teamName");
const teamCountry = document.getElementById("teamCountry");
const teamStadiums = document.getElementById("teamStadiums");

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function showError() {
    teamDetailCard.classList.add("hidden");
    teamDetailError.classList.remove("hidden");
}

function createStadiumCard(stadium) {
    const card = document.createElement("article");
    card.className = "stadium-card-item team-stadium-card";

    const title = document.createElement("h4");
    title.textContent = stadium.name || "Unnamed stadium";

    const city = document.createElement("p");
    city.className = "stadium-card-meta";
    city.textContent = stadium.city || "City unknown";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost";
    button.textContent = "Go to stadium";
    button.addEventListener("click", () => {
        if (!stadium?.name) return;
        window.location.href = `/stadyum/${toSlug(stadium.name)}`;
    });

    card.append(title, city, button);
    return card;
}

function renderTeam(team) {
    teamPageTitle.textContent = team.name || "Team detail";
    teamName.textContent = team.name || "-";

    if (team.country?.name) {
        const code = team.country.code ? ` (${team.country.code})` : "";
        teamCountry.textContent = `${team.country.name}${code}`;
    } else {
        teamCountry.textContent = "Country unknown";
    }

    teamStadiums.innerHTML = "";
    const stadiums = Array.isArray(team.stadiums) ? team.stadiums : [];
    if (stadiums.length === 0) {
        teamStadiums.innerHTML = '<div class="empty">No stadium information was found for this team.</div>';
    } else {
        stadiums.forEach((stadium) => teamStadiums.appendChild(createStadiumCard(stadium)));
    }

    teamDetailCard.classList.remove("hidden");
    teamDetailError.classList.add("hidden");
}

async function loadTeamDetail() {
    const slug = new URLSearchParams(window.location.search).get("teamSlug");
    if (!slug) {
        showError();
        return;
    }

    try {
        const response = await fetch(`/api/teams/by-slug/${encodeURIComponent(slug)}`);
        if (!response.ok) {
            showError();
            return;
        }

        const team = await response.json();
        if (!team?.id) {
            showError();
            return;
        }

        renderTeam(team);
    } catch {
        showError();
    }
}

loadTeamDetail();

