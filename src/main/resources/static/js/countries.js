const countryList = document.getElementById("countryList");
const stadiumDetail = document.getElementById("stadiumDetail");
const countrySearchInput = document.getElementById("countrySearchInput");
let activeStadiumRow = null;
let allCountries = [];

const requestedCountrySlug = new URLSearchParams(window.location.search).get("countrySlug");

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

const detailEls = {
    id: document.getElementById("detailId"),
    name: document.getElementById("detailName"),
    team: document.getElementById("detailTeam"),
    city: document.getElementById("detailCity"),
    capacity: document.getElementById("detailCapacity"),
    country: document.getElementById("detailCountry"),
    latitude: document.getElementById("detailLatitude"),
    longitude: document.getElementById("detailLongitude")
};

function groupByCountry(stadiums) {
    const map = new Map();

    stadiums.forEach((stadium) => {
        const country = stadium.country || {};
        const key = country.id || country.code || country.name || "unknown";
        const name = country.name || "Unknown country";

        if (!map.has(key)) {
            map.set(key, { name, code: country.code || "-", stadiums: [] });
        }

        map.get(key).stadiums.push(stadium);
    });

    return Array.from(map.values()).toSorted((a, b) => a.name.localeCompare(b.name));
}

function normalizeSearch(value) {
    return String(value || "")
        .toLocaleLowerCase("en-US")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function teamNames(stadium) {
    return (stadium.teams || []).map((team) => team?.name).filter(Boolean).join(", ");
}

function renderStadiumDetails(stadium) {
    if (!stadiumDetail) return;

    detailEls.id.textContent = stadium.id ?? "-";
    detailEls.name.textContent = stadium.name || "-";
    detailEls.team.textContent = teamNames(stadium) || "-";
    detailEls.city.textContent = stadium.city || "-";
    detailEls.capacity.textContent = stadium.capacity ?? "-";
    detailEls.country.textContent = stadium.country?.name || "-";
    detailEls.latitude.textContent = stadium.latitude ?? "-";
    detailEls.longitude.textContent = stadium.longitude ?? "-";

    stadiumDetail.classList.remove("hidden");
}

async function fetchStadiumDetails(stadiumId) {
    try {
        const response = await fetch(`/api/stadiums/${stadiumId}`);
        const data = await response.json();
        if (!response.ok) {
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function createStadiumRow(stadium) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "stadium-row";

    const left = document.createElement("span");
    left.className = "stadium-name";
    left.textContent = stadium.name || "Unnamed stadium";

    const team = document.createElement("span");
    team.className = "stadium-team";
    team.textContent = teamNames(stadium) || "Team unknown";

    const city = document.createElement("span");
    city.className = "city";
    city.textContent = stadium.city || "City unknown";

    row.append(left, team, city);

    row.addEventListener("click", async () => {
        if (activeStadiumRow) {
            activeStadiumRow.classList.remove("active");
        }
        activeStadiumRow = row;
        row.classList.add("active");

        const detailedStadium = (await fetchStadiumDetails(stadium.id)) || stadium;
        renderStadiumDetails(detailedStadium);
    });

    return row;
}

function createCountryItem(country, isOpen) {
    const wrapper = document.createElement("article");
    wrapper.className = `country-item ${isOpen ? "open" : ""}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "country-toggle";
    button.innerHTML = `<span>${country.name}</span><span class="country-meta">${country.code} | ${country.stadiums.length} ${country.stadiums.length === 1 ? "stadium" : "stadiums"}</span>`;

    const list = document.createElement("div");
    list.className = "stadium-list";
    country.stadiums
        .toSorted((a, b) => (a.name || "").localeCompare(b.name || ""))
        .forEach((stadium) => list.appendChild(createStadiumRow(stadium)));

    button.addEventListener("click", () => {
        wrapper.classList.toggle("open");
    });

    wrapper.append(button, list);
    return wrapper;
}

function filterCountries(countries, query) {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return countries;

    return countries
        .map((country) => {
            const matchesCountry = normalizeSearch(country.name).includes(normalizedQuery)
                || normalizeSearch(country.code).includes(normalizedQuery);
            const matchingStadiums = country.stadiums.filter((stadium) => {
                const haystack = [
                    stadium.name,
                    stadium.city,
                    stadium.country?.name,
                    ...(stadium.teams || []).map((team) => team?.name)
                ].map(normalizeSearch).join(" ");
                return haystack.includes(normalizedQuery);
            });

            if (matchesCountry) {
                return country;
            }

            if (matchingStadiums.length === 0) {
                return null;
            }

            return { ...country, stadiums: matchingStadiums };
        })
        .filter(Boolean);
}

function renderCountries() {
    if (!countryList) return;

    const filteredCountries = filterCountries(allCountries, countrySearchInput?.value || "");
    countryList.innerHTML = "";

    if (filteredCountries.length === 0) {
        countryList.innerHTML = '<div class="empty">No countries or stadiums matched your search.</div>';
        return;
    }

    let requestedElement = null;

    filteredCountries.forEach((country, index) => {
        const isRequested = requestedCountrySlug && toSlug(country.name) === requestedCountrySlug;
        const item = createCountryItem(country, isRequested || (!requestedCountrySlug && index === 0));
        if (isRequested) {
            requestedElement = item;
        }
        countryList.appendChild(item);
    });

    if (requestedElement) {
        requestedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

async function loadCountries() {
    if (!countryList) return;

    countryList.innerHTML = '<div class="empty">Loading countries...</div>';

    try {
        const response = await fetch("/api/stadiums");
        const data = await response.json();

        if (!response.ok) {
            countryList.innerHTML = `<div class="error">${data?.message || data?.error || "Could not load countries."}</div>`;
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            countryList.innerHTML = '<div class="empty">No countries found.</div>';
            return;
        }

        allCountries = groupByCountry(data);
        renderCountries();
    } catch (error) {
        countryList.innerHTML = `<div class="error">${error.message || "Unexpected error"}</div>`;
    }
}

if (countrySearchInput) {
    countrySearchInput.addEventListener("input", () => {
        activeStadiumRow = null;
        renderCountries();
    });
}

if (window.HoopAroundLayout?.user) {
    loadCountries();
}
