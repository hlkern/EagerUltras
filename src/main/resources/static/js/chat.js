const chatInfo = document.getElementById("chatInfo");
const chatUserSearchInput = document.getElementById("chatUserSearchInput");
const chatUserSearchResults = document.getElementById("chatUserSearchResults");
const chatStartBtn = document.getElementById("chatStartBtn");
const chatSummaryList = document.getElementById("chatSummaryList");
const chatThreadTitle = document.getElementById("chatThreadTitle");
const chatMessages = document.getElementById("chatMessages");
const chatSendForm = document.getElementById("chatSendForm");
const chatMessageInput = document.getElementById("chatMessageInput");
const chatSendBtn = document.getElementById("chatSendBtn");

const state = {
    activeUsername: null,
    summaries: [],
    searchUsers: [],
    searchDebounceId: null
};

function getCurrentUser() {
    return window.HoopAroundLayout?.user ?? null;
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

function setInfo(text) {
    if (chatInfo) {
        chatInfo.textContent = text || "";
    }
}

function renderSummaryList() {
    if (!chatSummaryList) return;

    chatSummaryList.innerHTML = "";
    if (!Array.isArray(state.summaries) || state.summaries.length === 0) {
        chatSummaryList.innerHTML = '<div class="empty">Henuz sohbet yok.</div>';
        return;
    }

    state.summaries.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `chat-summary-item ${state.activeUsername === item.otherUsername ? "active" : ""}`;

        const top = document.createElement("strong");
        top.textContent = item.otherUsername;

        const message = document.createElement("p");
        message.className = "stadium-card-meta";
        message.textContent = item.lastMessage || "Mesaj yok";

        const date = document.createElement("span");
        date.className = "stadium-card-meta";
        date.textContent = formatDate(item.lastMessageAt);

        button.append(top, message, date);
        button.addEventListener("click", () => openThread(item.otherUsername));
        chatSummaryList.appendChild(button);
    });
}

function renderMessages(messages) {
    if (!chatMessages) return;

    chatMessages.innerHTML = "";
    if (!Array.isArray(messages) || messages.length === 0) {
        chatMessages.innerHTML = '<div class="empty">Bu sohbette henuz mesaj yok.</div>';
        return;
    }

    const currentUserId = getCurrentUser()?.id;

    messages.forEach((message) => {
        const item = document.createElement("article");
        const mine = currentUserId != null && Number(currentUserId) === Number(message.senderId);
        item.className = `chat-message ${mine ? "mine" : ""}`;

        const meta = document.createElement("p");
        meta.className = "stadium-card-meta";
        meta.textContent = `${message.senderUsername} | ${formatDate(message.createdAt)}`;

        const content = document.createElement("p");
        content.textContent = message.content || "";

        item.append(meta, content);
        chatMessages.appendChild(item);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideSearchResults() {
    if (!chatUserSearchResults) return;
    chatUserSearchResults.classList.add("hidden");
    chatUserSearchResults.innerHTML = "";
    state.searchUsers = [];
}

function renderSearchResults(items) {
    if (!chatUserSearchResults) return;

    chatUserSearchResults.innerHTML = "";
    state.searchUsers = items;

    if (!Array.isArray(items) || items.length === 0) {
        chatUserSearchResults.innerHTML = '<div class="empty">Kullanici bulunamadi.</div>';
        chatUserSearchResults.classList.remove("hidden");
        return;
    }

    items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result-item";

        const title = document.createElement("strong");
        title.textContent = item.label;

        const meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = item.subtitle || "Kullanici";

        button.append(title, meta);
        button.addEventListener("click", () => {
            chatUserSearchInput.value = item.label || "";
            hideSearchResults();
        });

        chatUserSearchResults.appendChild(button);
    });

    chatUserSearchResults.classList.remove("hidden");
}

async function runUserSearch(query) {
    const currentUser = getCurrentUser();
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

        const users = (Array.isArray(data) ? data : []).filter((item) => {
            if (item.type !== "USER") return false;
            if (!currentUser?.username) return true;
            return String(item.label || "").toLowerCase() !== String(currentUser.username).toLowerCase();
        });

        renderSearchResults(users);
    } catch {
        hideSearchResults();
    }
}

async function loadSummaries() {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return;

    try {
        const response = await fetch(`/api/chats/${currentUser.id}`);
        const data = await response.json();

        if (!response.ok) {
            setInfo(data?.message || data?.error || "Sohbetler yuklenemedi.");
            return;
        }

        state.summaries = Array.isArray(data) ? data : [];
        renderSummaryList();
    } catch {
        setInfo("Sohbetler yuklenemedi.");
    }
}

async function openThread(username) {
    const currentUser = getCurrentUser();
    if (!currentUser?.id || !username) return;

    state.activeUsername = username;
    chatThreadTitle.textContent = `@${username}`;
    renderSummaryList();

    try {
        const response = await fetch(`/api/chats/${currentUser.id}/with/${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!response.ok) {
            renderMessages([]);
            setInfo(data?.message || data?.error || "Sohbet acilamadi.");
            return;
        }

        renderMessages(Array.isArray(data) ? data : []);
        setInfo("");
    } catch {
        renderMessages([]);
        setInfo("Sohbet acilamadi.");
    }
}

async function sendMessage() {
    const currentUser = getCurrentUser();
    const content = String(chatMessageInput?.value || "").trim();
    if (!currentUser?.id || !state.activeUsername) {
        setInfo("Once bir kullanici sec.");
        return;
    }
    if (!content) {
        setInfo("Mesaj bos olamaz.");
        return;
    }

    chatSendBtn.disabled = true;

    try {
        const response = await fetch(`/api/chats/${currentUser.id}/with/${encodeURIComponent(state.activeUsername)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            setInfo(data?.message || data?.error || "Mesaj gonderilemedi.");
            return;
        }

        chatMessageInput.value = "";
        await openThread(state.activeUsername);
        await loadSummaries();
    } catch {
        setInfo("Mesaj gonderilemedi.");
    } finally {
        chatSendBtn.disabled = false;
    }
}

function initNewChatActions() {
    if (chatUserSearchInput) {
        chatUserSearchInput.addEventListener("input", () => {
            const query = chatUserSearchInput.value;
            window.clearTimeout(state.searchDebounceId);
            state.searchDebounceId = window.setTimeout(() => runUserSearch(query), 220);
        });
    }

    if (chatStartBtn) {
        chatStartBtn.addEventListener("click", async () => {
            const username = String(chatUserSearchInput?.value || "").trim();
            if (!username) {
                setInfo("Kullanici adi gir.");
                return;
            }
            await openThread(username);
            hideSearchResults();
        });
    }

    document.addEventListener("click", (event) => {
        if (event.target !== chatUserSearchInput && !chatUserSearchResults.contains(event.target)) {
            hideSearchResults();
        }
    });
}

function initSendForm() {
    if (!chatSendForm) return;

    chatSendForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await sendMessage();
    });
}

async function initChatPage() {
    await loadSummaries();

    const initialUsername = new URLSearchParams(window.location.search).get("username");
    if (initialUsername) {
        chatUserSearchInput.value = initialUsername;
        await openThread(initialUsername);
    }
}

initNewChatActions();
initSendForm();
initChatPage();

