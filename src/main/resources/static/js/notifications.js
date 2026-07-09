const notificationsPageList = document.getElementById("notificationsPageList");

function formatNotificationDate(value) {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleString(window.HoopAroundI18n?.getLocale?.() || "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function loadNotificationsPage() {
    const userId = window.HoopAroundLayout?.user?.id;
    if (!userId || !notificationsPageList) return;

    notificationsPageList.innerHTML = '<div class="empty">Loading notifications...</div>';

    try {
        const response = await fetch(`/api/users/${userId}/notifications`);
        if (!response.ok) {
            notificationsPageList.innerHTML = '<div class="error">Notifications could not be loaded.</div>';
            return;
        }

        const notifications = await response.json();
        if (!Array.isArray(notifications) || notifications.length === 0) {
            notificationsPageList.innerHTML = '<div class="empty">No notifications yet.</div>';
        } else {
            notificationsPageList.innerHTML = "";
            notifications.forEach((notification) => {
                const item = document.createElement("a");
                item.href = notification.targetUrl || "#";
                item.className = "chat-summary-item";

                const top = document.createElement("strong");
                top.textContent = `@${notification.username || "unknown"}`;

                const message = document.createElement("p");
                message.className = "stadium-card-meta";
                message.textContent = notification.message || "";

                const date = document.createElement("span");
                date.className = "stadium-card-meta";
                date.textContent = formatNotificationDate(notification.createdAt);

                item.append(top, message, date);
                notificationsPageList.appendChild(item);
            });
        }

        await fetch(`/api/users/${userId}/notifications/mark-seen`, { method: "POST" });
    } catch {
        notificationsPageList.innerHTML = '<div class="error">Notifications could not be loaded.</div>';
    }
}

if (window.HoopAroundLayout?.user) {
    loadNotificationsPage();
}
