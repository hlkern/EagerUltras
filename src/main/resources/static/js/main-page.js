const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchResults = document.getElementById("globalSearchResults");
const latestVisitedCard = document.getElementById("latestVisitedCard");
const latestVisitedText = document.getElementById("latestVisitedText");
const latestWishlistCard = document.getElementById("latestWishlistCard");
const latestWishlistText = document.getElementById("latestWishlistText");

let searchDebounceId = null;
let searchItemsCache = [];
let activeSearchIndex = -1;
let postPreviewUrl = null;

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
        globalSearchResults.innerHTML = '<div class="empty">No results found.</div>';
        globalSearchResults.classList.remove("hidden");
        return;
    }

    items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-result-item";
        button.dataset.index = String(index);

        const title = document.createElement("strong");
        title.textContent = item.label || "Result";

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
    return dt.toLocaleString("en-US", {
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
            throw new Error("Highlights could not be loaded");
        }

        const data = await response.json();

        if (data?.latestVisitedStadium) {
            const matchAtText = formatMatchDate(data.latestVisitedMatchAt);
            if (latestVisitedText) {
                latestVisitedText.textContent = `${data.latestVisitedStadium.name || "Unknown stadium"} | ${matchAtText}`;
            }
            bindCardToStadium(latestVisitedCard, data.latestVisitedStadium);
        } else if (latestVisitedText) {
            latestVisitedText.textContent = "No matches added yet.";
        }

        if (data?.latestWishlistStadium) {
            const city = data.latestWishlistStadium.city || "";
            const cityPart = city ? ` | ${city}` : "";
            if (latestWishlistText) {
                latestWishlistText.textContent = `${data.latestWishlistStadium.name || "Unknown stadium"}${cityPart}`;
            }
            bindCardToStadium(latestWishlistCard, data.latestWishlistStadium);
        } else if (latestWishlistText) {
            latestWishlistText.textContent = "No stadiums added to your wishlist yet.";
        }
    } catch {
        if (latestVisitedText) {
            latestVisitedText.textContent = "Latest visit information could not be loaded.";
        }
        if (latestWishlistText) {
            latestWishlistText.textContent = "Wishlist information could not be loaded.";
        }
    }
}

function formatPostDate(value) {
    if (!value) return "-";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleString("en-US", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function buildPostCard(post) {
    const userId = window.HoopAroundLayout?.user?.id;

    const article = document.createElement("article");
    article.className = "timeline-post";
    article.dataset.postId = String(post.id);

    // Clickable body → opens post detail
    const cardBody = document.createElement("div");
    cardBody.className = "timeline-post-body";
    cardBody.addEventListener("click", () => openPostDetail(post));

    const meta = document.createElement("div");
    meta.className = "timeline-post-meta";
    meta.innerHTML = `<strong>@${post.authorUsername}</strong><span class="stadium-card-meta">${formatPostDate(post.createdAt)}</span>`;

    const content = document.createElement("p");
    content.className = "timeline-post-content";
    content.textContent = post.content;

    cardBody.append(meta, content);
    article.appendChild(cardBody);

    if (post.imageUrl) {
        const img = document.createElement("img");
        img.src = post.imageUrl;
        img.className = "timeline-post-img clickable-img";
        img.alt = "Post image";
        img.addEventListener("click", () => openLightbox(post.imageUrl));
        article.appendChild(img);
    }

    const actions = document.createElement("div");
    actions.className = "timeline-post-actions";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = `timeline-action-btn like-btn${post.likedByCurrentUser ? " liked" : ""}`;
    likeBtn.dataset.postId = String(post.id);
    likeBtn.innerHTML = `<span class="like-icon">${post.likedByCurrentUser ? "❤️" : "🤍"}</span> <span class="like-count">${post.likeCount}</span>`;
    likeBtn.addEventListener("click", () => handleToggleLike(post.id, likeBtn));

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";
    commentBtn.className = "timeline-action-btn comment-btn";
    commentBtn.innerHTML = `💬 <span class="comment-count">${post.commentCount}</span>`;
    commentBtn.addEventListener("click", () => toggleCommentSection(post.id, article));

    actions.append(likeBtn, commentBtn);
    article.appendChild(actions);

    const commentSection = document.createElement("div");
    commentSection.className = "comment-section hidden";
    commentSection.dataset.postId = String(post.id);

    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    commentList.innerHTML = '<p class="stadium-card-meta">Loading...</p>';

    const commentForm = document.createElement("form");
    commentForm.className = "comment-form";
    commentForm.innerHTML = `
        <input type="text" class="comment-input" placeholder="Write a comment..." maxlength="1000" />
        <button type="submit" class="ghost comment-submit">Send</button>
    `;
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = commentForm.querySelector(".comment-input");
        const text = input?.value?.trim();
        if (!text) return;
        const submitBtn = commentForm.querySelector(".comment-submit");
        submitBtn.disabled = true;
        try {
            const resp = await fetch(`/api/posts/${post.id}/comments/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text })
            });
            if (resp.ok) {
                input.value = "";
                await loadComments(post.id, commentList);
                const countEl = article.querySelector(".comment-count");
                if (countEl) countEl.textContent = String(Number(countEl.textContent || 0) + 1);
            }
        } finally {
            submitBtn.disabled = false;
        }
    });

    commentSection.append(commentList, commentForm);
    article.appendChild(commentSection);

    return article;
}

async function loadComments(postId, listEl) {
    listEl.innerHTML = '<p class="stadium-card-meta">Loading...</p>';
    try {
        const resp = await fetch(`/api/posts/${postId}/comments`);
        if (!resp.ok) {
            listEl.innerHTML = '<p class="stadium-card-meta">Comments could not be loaded.</p>';
            return;
        }
        const comments = await resp.json();
        if (!Array.isArray(comments) || comments.length === 0) {
            listEl.innerHTML = '<p class="stadium-card-meta">No comments yet.</p>';
            return;
        }
        listEl.innerHTML = "";
        comments.forEach((c) => {
            const div = document.createElement("div");
            div.className = "comment-item";
            div.innerHTML = `<strong>@${c.authorUsername}</strong> <span class="stadium-card-meta">${formatPostDate(c.createdAt)}</span><p>${c.content}</p>`;
            listEl.appendChild(div);
        });
    } catch {
        listEl.innerHTML = '<p class="stadium-card-meta">Comments could not be loaded.</p>';
    }
}

async function toggleCommentSection(postId, articleEl) {
    const section = articleEl.querySelector(`.comment-section[data-post-id="${postId}"]`);
    if (!section) return;
    const isHidden = section.classList.contains("hidden");
    section.classList.toggle("hidden");
    if (isHidden) {
        const listEl = section.querySelector(".comment-list");
        await loadComments(postId, listEl);
    }
}

async function handleToggleLike(postId, btnEl) {
    const userId = window.HoopAroundLayout?.user?.id;
    if (!userId) return;
    btnEl.disabled = true;
    try {
        const resp = await fetch(`/api/posts/${postId}/likes/${userId}`, { method: "POST" });
        if (resp.ok) {
            const data = await resp.json();
            const iconEl = btnEl.querySelector(".like-icon");
            const countEl = btnEl.querySelector(".like-count");
            if (data.liked) {
                btnEl.classList.add("liked");
                if (iconEl) iconEl.textContent = "❤️";
            } else {
                btnEl.classList.remove("liked");
                if (iconEl) iconEl.textContent = "🤍";
            }
            if (countEl) countEl.textContent = String(data.likeCount);
        }
    } finally {
        btnEl.disabled = false;
    }
}

async function loadTimeline() {
    const listEl = document.getElementById("timelineList");
    if (!listEl) return;
    const userId = window.HoopAroundLayout?.user?.id;

    try {
        const url = userId ? `/api/posts?userId=${userId}` : "/api/posts";
        const response = await fetch(url);
        if (!response.ok) {
            listEl.innerHTML = '<p class="stadium-card-meta">Timeline could not be loaded.</p>';
            return;
        }

        const posts = await response.json();
        if (!Array.isArray(posts) || posts.length === 0) {
            listEl.innerHTML = '<p class="stadium-card-meta">No posts yet. Be the first to share one.</p>';
            return;
        }

        listEl.innerHTML = "";
        posts.forEach((post) => listEl.appendChild(buildPostCard(post)));
    } catch {
        listEl.innerHTML = '<p class="stadium-card-meta">Timeline could not be loaded.</p>';
    }
}

function closePostModal() {
    const postModalOverlay = document.getElementById("postModalOverlay");
    const postForm = document.getElementById("postForm");
    const postImagePreview = document.getElementById("postImagePreview");
    const postCharCount = document.getElementById("postCharCount");
    const postFormInfo = document.getElementById("postFormInfo");

    postModalOverlay?.classList.add("hidden");
    postForm?.reset();
    if (postPreviewUrl) {
        URL.revokeObjectURL(postPreviewUrl);
        postPreviewUrl = null;
    }
    if (postImagePreview) {
        postImagePreview.innerHTML = "";
        postImagePreview.classList.add("hidden");
    }
    if (postCharCount) {
        postCharCount.textContent = "0 / 2000";
    }
    if (postFormInfo) {
        postFormInfo.textContent = "";
    }
}

function initFab() {
    const fabBtn = document.getElementById("fabBtn");
    const fabMenu = document.getElementById("fabMenu");
    const fabPostBtn = document.getElementById("fabPostBtn");
    const fabMatchBtn = document.getElementById("fabMatchBtn");
    const postModalOverlay = document.getElementById("postModalOverlay");
    const postModalClose = document.getElementById("postModalClose");
    const postForm = document.getElementById("postForm");
    const postContent = document.getElementById("postContent");
    const postImage = document.getElementById("postImage");
    const postImagePreview = document.getElementById("postImagePreview");
    const postCharCount = document.getElementById("postCharCount");
    const postSubmitBtn = document.getElementById("postSubmitBtn");
    const postFormInfo = document.getElementById("postFormInfo");

    if (!fabBtn || !fabMenu) return;

    fabBtn.addEventListener("click", () => {
        fabMenu.classList.toggle("hidden");
        fabBtn.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        if (!fabBtn.contains(event.target) && !fabMenu.contains(event.target)) {
            fabMenu.classList.add("hidden");
            fabBtn.classList.remove("open");
        }
    });

    fabPostBtn?.addEventListener("click", () => {
        fabMenu.classList.add("hidden");
        fabBtn.classList.remove("open");
        postModalOverlay?.classList.remove("hidden");
        postContent?.focus();
    });

    fabMatchBtn?.addEventListener("click", () => {
        window.location.href = "/collection-add.html";
    });

    postModalClose?.addEventListener("click", closePostModal);
    postModalOverlay?.addEventListener("click", (event) => {
        if (event.target === postModalOverlay) {
            closePostModal();
        }
    });

    postContent?.addEventListener("input", () => {
        if (postCharCount) {
            postCharCount.textContent = `${postContent.value.length} / 2000`;
        }
    });

    postImage?.addEventListener("change", () => {
        if (postPreviewUrl) {
            URL.revokeObjectURL(postPreviewUrl);
            postPreviewUrl = null;
        }

        if (!postImage.files || postImage.files.length === 0) {
            postImagePreview?.classList.add("hidden");
            if (postImagePreview) {
                postImagePreview.innerHTML = "";
            }
            return;
        }

        postPreviewUrl = URL.createObjectURL(postImage.files[0]);
        if (postImagePreview) {
            postImagePreview.innerHTML = `<img src="${postPreviewUrl}" alt="Preview" class="timeline-post-img" />`;
            postImagePreview.classList.remove("hidden");
        }
    });

    postForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = window.HoopAroundLayout?.user?.id;
        const content = postContent?.value?.trim();
        if (!userId) {
            if (postFormInfo) {
                postFormInfo.textContent = "User information could not be found.";
            }
            return;
        }
        if (!content) {
            if (postFormInfo) {
                postFormInfo.textContent = "Content cannot be empty.";
            }
            return;
        }

        if (postSubmitBtn) {
            postSubmitBtn.disabled = true;
        }
        if (postFormInfo) {
            postFormInfo.textContent = "";
        }

        try {
            const formData = new FormData();
            formData.append("content", content);
            if (postImage?.files?.length > 0) {
                formData.append("image", postImage.files[0]);
            }

            const response = await fetch(`/api/posts/${userId}`, {
                method: "POST",
                body: formData
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                if (postFormInfo) {
                    postFormInfo.textContent = data?.message || data?.error || "Post could not be published.";
                }
                return;
            }

            closePostModal();
            await loadTimeline();
        } catch {
            if (postFormInfo) {
                postFormInfo.textContent = "Post could not be published.";
            }
        } finally {
            if (postSubmitBtn) {
                postSubmitBtn.disabled = false;
            }
        }
    });
}

async function loadNotifications() {
    const userId = window.HoopAroundLayout?.user?.id;
    const listEl = document.getElementById("notificationsList");
    if (!userId || !listEl) return;

    try {
        const response = await fetch(`/api/chats/${userId}`);
        if (!response.ok) {
            listEl.innerHTML = '<p class="stadium-card-meta">Notifications could not be loaded.</p>';
            return;
        }

        const summaries = await response.json();
        const unread = (Array.isArray(summaries) ? summaries : []).filter((s) => s.unreadCount > 0);

        if (unread.length === 0) {
            listEl.innerHTML = '<p class="stadium-card-meta">No unread messages.</p>';
            return;
        }

        listEl.innerHTML = "";
        unread.forEach((s) => {
            const item = document.createElement("a");
            item.href = `/chat.html?username=${encodeURIComponent(s.otherUsername)}`;
            item.className = "notification-item";

            const name = document.createElement("strong");
            name.textContent = `@${s.otherUsername}`;

            const badge = document.createElement("span");
            badge.className = "notification-badge";
            badge.textContent = String(s.unreadCount);

            const preview = document.createElement("p");
            preview.className = "stadium-card-meta";
            preview.textContent = s.lastMessage || "";

            item.append(name, badge, preview);
            listEl.appendChild(item);
        });
    } catch {
        listEl.innerHTML = '<p class="stadium-card-meta">Notifications could not be loaded.</p>';
    }
}

function openPostDetail(post) {
    const userId = window.HoopAroundLayout?.user?.id;
    const overlay = document.getElementById("postDetailOverlay");
    if (!overlay) return;

    document.getElementById("postDetailAuthor").textContent = `@${post.authorUsername}`;
    document.getElementById("postDetailDate").textContent = formatPostDate(post.createdAt);
    document.getElementById("postDetailContent").textContent = post.content;

    const imgWrap = document.getElementById("postDetailImage");
    if (post.imageUrl) {
        imgWrap.innerHTML = `<img src="${post.imageUrl}" class="timeline-post-img clickable-img" alt="Post image" style="margin-bottom:4px;" />`;
        imgWrap.querySelector("img").addEventListener("click", () => openLightbox(post.imageUrl));
        imgWrap.classList.remove("hidden");
    } else {
        imgWrap.innerHTML = "";
        imgWrap.classList.add("hidden");
    }

    const likeBtn = document.getElementById("postDetailLikeBtn");
    if (likeBtn) {
        likeBtn.className = `timeline-action-btn like-btn${post.likedByCurrentUser ? " liked" : ""}`;
        likeBtn.innerHTML = `<span class="like-icon">${post.likedByCurrentUser ? "❤️" : "🤍"}</span> <span class="like-count">${post.likeCount}</span>`;
        likeBtn.onclick = () => {
            handleToggleLike(post.id, likeBtn);
            // Sync count back to timeline card
            const card = document.querySelector(`.timeline-post[data-post-id="${post.id}"]`);
            const cardLikeBtn = card?.querySelector(".like-btn");
            if (cardLikeBtn) {
                setTimeout(() => {
                    const likeIcon = likeBtn.querySelector(".like-icon");
                    const likeCount = likeBtn.querySelector(".like-count");
                    const cardIcon = cardLikeBtn.querySelector(".like-icon");
                    const cardCount = cardLikeBtn.querySelector(".like-count");
                    if (cardIcon) cardIcon.textContent = likeIcon?.textContent || "";
                    if (cardCount) cardCount.textContent = likeCount?.textContent || "";
                    if (likeBtn.classList.contains("liked")) cardLikeBtn.classList.add("liked");
                    else cardLikeBtn.classList.remove("liked");
                }, 200);
            }
        };
    }

    const commentList = document.getElementById("postDetailCommentList");
    if (commentList) loadComments(post.id, commentList);

    const commentForm = document.getElementById("postDetailCommentForm");
    commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = document.getElementById("postDetailCommentInput");
        const text = input?.value?.trim();
        if (!text || !userId) return;
        const submitBtn = commentForm.querySelector(".comment-submit");
        submitBtn.disabled = true;
        try {
            const resp = await fetch(`/api/posts/${post.id}/comments/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text })
            });
            if (resp.ok) {
                input.value = "";
                await loadComments(post.id, commentList);
                const card = document.querySelector(`.timeline-post[data-post-id="${post.id}"]`);
                const countEl = card?.querySelector(".comment-count");
                if (countEl) countEl.textContent = String(Number(countEl.textContent || 0) + 1);
            }
        } finally {
            submitBtn.disabled = false;
        }
    };

    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closePostDetail() {
    document.getElementById("postDetailOverlay")?.classList.add("hidden");
    document.body.style.overflow = "";
}

function openLightbox(imageUrl) {
    const overlay = document.getElementById("lightboxOverlay");
    const img = document.getElementById("lightboxImg");
    if (!overlay || !img) return;
    img.src = imageUrl;
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    document.getElementById("lightboxOverlay")?.classList.add("hidden");
    if (!document.getElementById("postDetailOverlay")?.classList.contains("hidden")) return;
    document.body.style.overflow = "";
}

function initPostDetailModal() {
    const overlay = document.getElementById("postDetailOverlay");
    if (!overlay) return;
    document.getElementById("postDetailClose")?.addEventListener("click", closePostDetail);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closePostDetail(); });
}

function initLightbox() {
    const overlay = document.getElementById("lightboxOverlay");
    if (!overlay) return;
    document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeLightbox(); closePostDetail(); }
    });
}

if (window.HoopAroundLayout?.user) {
    initGlobalSearch();
    loadDashboardHighlights();
    loadNotifications();
    loadTimeline();
    initFab();
    initPostDetailModal();
    initLightbox();
}
