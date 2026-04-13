const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const alertBox = document.getElementById("alertBox");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const SESSION_KEY = "hooparound_user";

if (sessionStorage.getItem(SESSION_KEY)) {
    window.location.replace("/main.html");
}

function setActiveTab(type) {
    const isLogin = type === "login";
    loginTab.classList.toggle("active", isLogin);
    registerTab.classList.toggle("active", !isLogin);
    loginForm.classList.toggle("active", isLogin);
    registerForm.classList.toggle("active", !isLogin);
    hideAlert();
}

function showAlert(type, message) {
    alertBox.className = `alert ${type === "ok" ? "ok" : "err"}`;
    alertBox.textContent = message;
}

function hideAlert() {
    alertBox.className = "alert hidden";
    alertBox.textContent = "";
}

function parseError(payload, fallback) {
    if (!payload) return fallback;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    return fallback;
}

async function callApi(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(parseError(data, "Request failed"));
    }

    return data;
}

loginTab.addEventListener("click", () => setActiveTab("login"));
registerTab.addEventListener("click", () => setActiveTab("register"));

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideAlert();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    loginBtn.disabled = true;

    try {
        const data = await callApi("/api/auth/login", { email, password });
        const username = data?.user?.username || "groundhooper";

        // Keep a lightweight session snapshot for static page navigation.
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user || { email }));
        showAlert("ok", `Welcome ${username}! Redirecting...`);

        setTimeout(() => {
            window.location.href = "/main.html";
        }, 500);
    } catch (error) {
        showAlert("err", error.message || "Login failed");
    } finally {
        loginBtn.disabled = false;
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideAlert();

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    registerBtn.disabled = true;

    try {
        await callApi("/api/auth/register", { username, email, password });
        showAlert("ok", "Registration completed. You can login now.");
        setActiveTab("login");
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").focus();
        registerForm.reset();
    } catch (error) {
        showAlert("err", error.message || "Registration failed");
    } finally {
        registerBtn.disabled = false;
    }
});

setActiveTab("login");
