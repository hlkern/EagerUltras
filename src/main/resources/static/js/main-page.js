const countryList = document.getElementById("countryList");
const stadiumDetail = document.getElementById("stadiumDetail");
const matchForm = document.getElementById("matchForm");
const matchStadiumId = document.getElementById("matchStadiumId");
const matchHomeTeamId = document.getElementById("matchHomeTeamId");
const matchAwayTeamId = document.getElementById("matchAwayTeamId");
const matchAt = document.getElementById("matchAt");
const matchRating = document.getElementById("matchRating");
const matchComment = document.getElementById("matchComment");
const matchFormInfo = document.getElementById("matchFormInfo");
const matchSubmitBtn = document.getElementById("matchSubmitBtn");
const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchResults = document.getElementById("globalSearchResults");
const latestVisitedCard = document.getElementById("latestVisitedCard");
const latestVisitedText = document.getElementById("latestVisitedText");
const latestWishlistCard = document.getElementById("latestWishlistCard");
const latestWishlistText = document.getElementById("latestWishlistText");

let activeStadiumRow = null;
let stadiumIndex = new Map();
let allTeams = [];
let searchDebounceId = null;
let searchItemsCache = [];
let activeSearchIndex = -1;

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

function hideSearchResults() {
    if (!globalSearchResults) return;
    globalSearchResults.classList.add("hidden");
    globalSearchResults.innerHTML = "";
    searchItemsCache = [];
    activeSearchIndex = -1;
}

function goToSearchItem(item) {
    if (item?.seoPath) {
        window.location.href = item.seoPath;
    }
}

function setActiveSearchIndex(nextIndex) {
    if (!globalSearchResults) return;
    const buttons = Array.from(globalSearchResults.querySelectorAll(".search-result-item"));
    buttons.forEach((btn, idx) => btn.classList.toggle("active", idx === nextIndex));
    activeSearchIndex = nextIndex;
}

function renderSearchResults(items) {
    if (!globalSearchResults) return;

    globalSearchResults.innerHTML = "";
    searchItemsCache = Array.isArray(items) ? items : [];
    activeSearchIndex = -1;

    if (!Array.isArray(items) || items.length === 0) {
        globalSearchResults.innerHTML = '<div class="empty">Sonuc bulunamadi.</div>';
        globalSearchResults.classList.remove("hidden");
        return;
    }

    items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result-item";
        button.dataset.index = String(index);

        const title = document.createElement("strong");
        title.textContent = item.label || "Sonuc";

        const meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = `${item.type || "ITEM"} | ${item.subtitle || "-"}`;

        button.append(title, meta);
        button.addEventListener("click", () => goToSearchItem(item));

        globalSearchResults.appendChild(button);
    });

    globalSearchResults.classList.remove("hidden");
}

async function runSearch(query) {
    if (!query || query.trim().length < 1) {
        hideSearchResults();
        return;
    }

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        if (!response.ok) {
            hideSearchResults();
            return;
        }
        renderSearchResults(data);
    } catch {
        hideSearchResults();
    }
}

function initGlobalSearch() {
    if (!globalSearchInput || !globalSearchResults) return;

    globalSearchInput.addEventListener("input", () => {
        const query = globalSearchInput.value;
        window.clearTimeout(searchDebounceId);
        searchDebounceId = window.setTimeout(() => runSearch(query), 220);
    });

    globalSearchInput.addEventListener("keydown", async (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (searchItemsCache.length === 0) return;
            const next = activeSearchIndex < searchItemsCache.length - 1 ? activeSearchIndex + 1 : 0;
            setActiveSearchIndex(next);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (searchItemsCache.length === 0) return;
            const next = activeSearchIndex > 0 ? activeSearchIndex - 1 : searchItemsCache.length - 1;
            setActiveSearchIndex(next);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            if (searchItemsCache.length === 0) {
                await runSearch(globalSearchInput.value || "");
            }
            if (searchItemsCache.length === 0) return;
            const selected = activeSearchIndex >= 0 ? activeSearchIndex : 0;
            goToSearchItem(searchItemsCache[selected]);
        }
    });

    document.addEventListener("click", (event) => {
        if (event.target !== globalSearchInput && !globalSearchResults.contains(event.target)) {
            hideSearchResults();
        }
    });
}

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

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function teamNames(stadium) {
    return (stadium.teams || [])
        .map((team) => team?.name)
        .filter(Boolean)
        .join(", ");
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
    button.innerHTML = `<span>${country.name}</span><span class="country-meta">${country.code} | ${country.stadiums.length} stadium</span>`;

    const list = document.createElement("div");
    list.className = "stadium-list";
    country.stadiums
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        .forEach((stadium) => list.appendChild(createStadiumRow(stadium)));

    button.addEventListener("click", () => {
        wrapper.classList.toggle("open");
    });

    wrapper.append(button, list);
    return wrapper;
}

function fillTeamSelect(selectEl, teams, placeholderText) {
    if (!selectEl) return;

    selectEl.innerHTML = `<option value="">${placeholderText || "Takim sec"}</option>`;
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
    fillTeamSelect(matchAwayTeamId, awayCandidates, "Deplasman takim sec");
}

function onStadiumChanged() {
    const stadiumId = Number(matchStadiumId?.value || 0);
    const selectedStadium = stadiumIndex.get(stadiumId);
    const teams = selectedStadium?.teams || [];

    fillTeamSelect(matchHomeTeamId, teams, "Ev sahibi takim sec");
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

function toSlug(value) {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function formatMatchDate(value) {
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

function bindCardToStadium(cardEl, stadium) {
    if (!cardEl || !stadium?.name) return;

    cardEl.classList.add("card-link");
    cardEl.onclick = () => {
        window.location.href = `/stadyum/${toSlug(stadium.name)}`;
    };
}

function resetDashboardCards() {
    if (latestVisitedCard) {
        latestVisitedCard.classList.remove("card-link");
        latestVisitedCard.onclick = null;
    }
    if (latestWishlistCard) {
        latestWishlistCard.classList.remove("card-link");
        latestWishlistCard.onclick = null;
    }
}

async function loadDashboardHighlights() {
    const userId = window.HoopAroundLayout?.user?.id;
    if (!userId) return;

    resetDashboardCards();

    try {
        const response = await fetch(`/api/users/${userId}/dashboard-highlights`);
        if (!response.ok) {
            throw new Error("Highlights yuklenemedi");
        }

        const data = await response.json();

        if (data?.latestVisitedStadium) {
            const matchAtText = formatMatchDate(data.latestVisitedMatchAt);
            if (latestVisitedText) {
                latestVisitedText.textContent = `${data.latestVisitedStadium.name || "Bilinmeyen stad"} | ${matchAtText}`;
            }
            bindCardToStadium(latestVisitedCard, data.latestVisitedStadium);
        } else if (latestVisitedText) {
            latestVisitedText.textContent = "Henuz mac eklenmedi.";
        }

        if (data?.latestWishlistStadium) {
            const city = data.latestWishlistStadium.city || "";
            const cityPart = city ? ` | ${city}` : "";
            if (latestWishlistText) {
                latestWishlistText.textContent = `${data.latestWishlistStadium.name || "Bilinmeyen stad"}${cityPart}`;
            }
            bindCardToStadium(latestWishlistCard, data.latestWishlistStadium);
        } else if (latestWishlistText) {
            latestWishlistText.textContent = "Wishlist'e henuz stad eklenmedi.";
        }
    } catch {
        if (latestVisitedText) {
            latestVisitedText.textContent = "Son ziyaret bilgisi yuklenemedi.";
        }
        if (latestWishlistText) {
            latestWishlistText.textContent = "Wishlist bilgisi yuklenemedi.";
        }
    }
}

async function initMatchForm(stadiums) {
    if (!matchForm || !matchStadiumId) return;

    stadiumIndex = new Map((stadiums || []).map((s) => [s.id, s]));
    matchStadiumId.innerHTML = '<option value="">Stadyum sec</option>';

    stadiums
        .toSorted((a, b) => (a.name || "").localeCompare(b.name || ""))
        .forEach((stadium) => {
            const option = document.createElement("option");
            option.value = String(stadium.id);
            option.textContent = `${stadium.name} (${stadium.city || "Unknown city"})`;
            matchStadiumId.appendChild(option);
        });

    await loadAllTeams();

    fillTeamSelect(matchHomeTeamId, [], "Ev sahibi takim sec");
    fillTeamSelect(matchAwayTeamId, allTeams, "Deplasman takim sec");

    matchStadiumId.addEventListener("change", onStadiumChanged);
    matchHomeTeamId?.addEventListener("change", updateAwayTeams);

    matchForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = window.HoopAroundLayout?.user?.id;
        if (!userId) {
            if (matchFormInfo) matchFormInfo.textContent = "Kullanici bilgisi bulunamadi.";
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
            if (matchFormInfo) matchFormInfo.textContent = "Lutfen gerekli alanlari doldur.";
            return;
        }

        if (payload.homeTeamId === payload.awayTeamId) {
            if (matchFormInfo) matchFormInfo.textContent = "Ev sahibi ve deplasman takimlari farkli olmali.";
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
                    matchFormInfo.textContent = body?.message || body?.error || "Mac koleksiyona eklenemedi.";
                }
                return;
            }

            if (matchFormInfo) matchFormInfo.textContent = "Mac koleksiyona eklendi.";
            matchForm.reset();
            fillTeamSelect(matchHomeTeamId, [], "Ev sahibi takim sec");
            fillTeamSelect(matchAwayTeamId, allTeams, "Deplasman takim sec");
            await loadDashboardHighlights();
        } catch (error) {
            if (matchFormInfo) matchFormInfo.textContent = error.message || "Mac koleksiyona eklenemedi.";
        } finally {
            if (matchSubmitBtn) matchSubmitBtn.disabled = false;
        }
    });
}

async function loadCountriesAndStadiums() {
    const hasCountryList = !!countryList;

    if (hasCountryList) {
        countryList.innerHTML = '<div class="empty">Loading countries...</div>';
    }

    try {
        const response = await fetch("/api/stadiums");
        const data = await response.json();

        if (!response.ok) {
            const message = data?.message || data?.error || "Could not load stadiums.";
            if (hasCountryList) {
                countryList.innerHTML = `<div class="error">${message}</div>`;
            }
            if (matchFormInfo) {
                matchFormInfo.textContent = message;
            }
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            if (hasCountryList) {
                countryList.innerHTML = '<div class="empty">No stadium data found.</div>';
            }
            if (matchFormInfo) {
                matchFormInfo.textContent = "Stadyum verisi bulunamadi.";
            }
            return;
        }

        if (hasCountryList) {
            const countries = groupByCountry(data);
            countryList.innerHTML = "";
            countries.forEach((country, index) => {
                countryList.appendChild(createCountryItem(country, index === 0));
            });
        }

        initMatchForm(data);
    } catch (error) {
        if (hasCountryList) {
            countryList.innerHTML = `<div class="error">${error.message || "Unexpected error"}</div>`;
        }
        if (matchFormInfo) {
            matchFormInfo.textContent = error.message || "Stadyum verisi yuklenemedi.";
        }
    }
}

if (window.HoopAroundLayout?.user) {
    initGlobalSearch();
    loadCountriesAndStadiums();
    loadDashboardHighlights();
}
