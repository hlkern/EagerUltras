const SESSION_KEY = "hooparound_user";

function ensureSession() {
    const rawUser = sessionStorage.getItem(SESSION_KEY);
    if (!rawUser) {
        window.location.replace("/");
        return null;
    }

    const hasValidShape = rawUser.trim().startsWith("{") && rawUser.trim().endsWith("}");
    if (!hasValidShape) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("/");
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.replace("/");
        return null;
    }
}

function initSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    const openSidebar = () => {
        document.body.classList.add("menu-open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
        if (sidebar) sidebar.setAttribute("aria-hidden", "false");
    };

    const closeSidebar = () => {
        document.body.classList.remove("menu-open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        if (sidebar) sidebar.setAttribute("aria-hidden", "true");
    };

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            if (document.body.classList.contains("menu-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    if (sidebarLinks.length > 0) {
        sidebarLinks.forEach((link) => link.addEventListener("click", closeSidebar));
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

function initActiveMenu() {
    let page = document.body.dataset.page;
    if (page === "user-profile") {
        const profileUsername = new URLSearchParams(window.location.search).get("username");
        if (profileUsername && user?.username && profileUsername === user.username) {
            page = "my-profile";
        }
    }
    if (!page) return;

    const currentLink = document.querySelector(`.sidebar-link[data-nav="${page}"]`);
    if (currentLink) {
        currentLink.classList.add("active");
    }
}

function initWelcome(user) {
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (!welcomeTitle || !user) return;
    const preferredName = user.username || user.email || "Groundhooper";
    const translated = window.HoopAroundI18n?.t?.("welcome_user", { name: preferredName });
    welcomeTitle.textContent = translated || `Welcome, ${preferredName}`;
}

function initProfileLink(user) {
    if (!user?.username) return;
    const profileLinks = document.querySelectorAll('.sidebar-link[data-nav="my-profile"]');
    profileLinks.forEach((link) => {
        link.setAttribute("href", `/kullanici/${encodeURIComponent(user.username)}`);
    });
}

function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "/";
    });
}

const user = ensureSession();
if (user) {
    initProfileLink(user);
    initSidebar();
    initActiveMenu();
    initWelcome(user);
    initLogout();
}

window.HoopAroundLayout = {
    user,
    SESSION_KEY
};

