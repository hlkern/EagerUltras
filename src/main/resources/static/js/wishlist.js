const wishlistInfo = document.getElementById("wishlistInfo");
const wishlistList = document.getElementById("wishlistList");

function getCurrentUserId() {
    return window.HoopAroundLayout?.user?.id ?? null;
}

function createWishlistCard(stadium, onRemoved) {
    const card = document.createElement("article");
    card.className = "stadium-card-item";

    const title = document.createElement("h4");
    title.textContent = stadium.name || "Unnamed stadium";

    const line1 = document.createElement("p");
    line1.className = "stadium-card-meta";
    line1.textContent = `${stadium.country?.name || "Unknown country"} | ${stadium.city || "City unknown"}`;

    const line2 = document.createElement("p");
    line2.className = "stadium-card-meta";
    line2.textContent = `Capacity: ${stadium.capacity ?? "-"}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "ghost";
    removeBtn.type = "button";
    removeBtn.textContent = "Wishlistten cikar";

    removeBtn.addEventListener("click", async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            wishlistInfo.textContent = "User information could not be found.";
            return;
        }

        try {
            const response = await fetch(`/api/user-wishlist/${userId}/${stadium.id}`, {
                method: "DELETE"
            });

            if (response.status === 204 || response.ok || response.status === 404) {
                onRemoved(stadium.id);
                return;
            }

            const payload = await response.json().catch(() => null);
            wishlistInfo.textContent = payload?.message || payload?.error || "Stadium could not be removed from wishlist.";
        } catch (error) {
            wishlistInfo.textContent = error.message || "Stadium could not be removed from wishlist.";
        }
    });

    card.append(title, line1, line2, removeBtn);
    return card;
}

function renderWishlist(stadiums) {
    if (!wishlistList || !wishlistInfo) return;

    wishlistList.innerHTML = "";

    if (!Array.isArray(stadiums) || stadiums.length === 0) {
        wishlistInfo.textContent = "Your wishlist is empty.";
        return;
    }

    wishlistInfo.textContent = `${stadiums.length} stadyum wishlistte.`;

    const state = [...stadiums];
    const removeFromState = (stadiumId) => {
        const idx = state.findIndex((s) => s.id === stadiumId);
        if (idx !== -1) {
            state.splice(idx, 1);
        }
        renderWishlist(state);
    };

    state.forEach((stadium) => wishlistList.appendChild(createWishlistCard(stadium, removeFromState)));
}

async function loadWishlist() {
    if (!wishlistInfo || !wishlistList) return;

    const userId = getCurrentUserId();
    if (!userId) {
        wishlistInfo.textContent = "User information could not be found.";
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/wishlist`);
        const data = await response.json();

        if (!response.ok) {
            wishlistInfo.textContent = data?.message || data?.error || "Wishlist could not be loaded.";
            return;
        }

        renderWishlist(data);
    } catch (error) {
        wishlistInfo.textContent = error.message || "Wishlist could not be loaded.";
    }
}

if (window.HoopAroundLayout?.user) {
    loadWishlist();
}
