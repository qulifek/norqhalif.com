/* =========================
   ADMIN DASHBOARD
   JOURNAL + GOALS + QUOTES MANAGER
========================= */

import {
    auth,
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

/* =========================
   LOGIN ELEMENTS
========================= */

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginStatus = document.getElementById("loginStatus");

const logoutBtn = document.getElementById("logoutBtn");

/* =========================
   JOURNAL ELEMENTS
========================= */

const articleForm = document.getElementById("articleForm");
const articleStatus = document.getElementById("articleStatus");
const articleList = document.getElementById("articleList");

const formTitle = document.getElementById("formTitle");
const saveArticleBtn = document.getElementById("saveArticleBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const articleTitle = document.getElementById("articleTitle");
const articleCategory = document.getElementById("articleCategory");
const articleMeta = document.getElementById("articleMeta");
const articleImage = document.getElementById("articleImage");
const imagePreview = document.getElementById("imagePreview");
const articleExcerpt = document.getElementById("articleExcerpt");
const articleContent = document.getElementById("articleContent");
const articleOrder = document.getElementById("articleOrder");
const articlePublished = document.getElementById("articlePublished");
const articleFeatured = document.getElementById("articleFeatured");

/* =========================
   GOALS ELEMENTS
========================= */

const goalForm = document.getElementById("goalForm");
const goalList = document.getElementById("goalList");
const goalStatus = document.getElementById("goalStatus");

const goalFormTitle = document.getElementById("goalFormTitle");
const saveGoalBtn = document.getElementById("saveGoalBtn");
const cancelGoalEditBtn = document.getElementById("cancelGoalEditBtn");

const goalTitle = document.getElementById("goalTitle");
const goalCategory = document.getElementById("goalCategory");
const goalYear = document.getElementById("goalYear");
const goalDescription = document.getElementById("goalDescription");
const goalOrder = document.getElementById("goalOrder");
const goalPublished = document.getElementById("goalPublished");

/* =========================
   QUOTES ELEMENTS
========================= */

const quoteForm = document.getElementById("quoteForm");
const quoteListAdmin = document.getElementById("quoteListAdmin");
const quoteStatus = document.getElementById("quoteStatus");

const quoteFormTitle = document.getElementById("quoteFormTitle");
const saveQuoteBtn = document.getElementById("saveQuoteBtn");
const cancelQuoteEditBtn = document.getElementById("cancelQuoteEditBtn");

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteCategory = document.getElementById("quoteCategory");
const quoteOrder = document.getElementById("quoteOrder");
const quotePublished = document.getElementById("quotePublished");
const quoteFeatured = document.getElementById("quoteFeatured");

/* =========================
   STATE
========================= */

let editingArticleId = null;
let savedArticles = [];

let editingGoalId = null;
let savedGoals = [];

let editingQuoteId = null;
let savedQuotes = [];

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

    if(user){
        loginPanel.style.display = "none";
        dashboardPanel.classList.add("active");

        loadArticles();
        loadGoals();
        loadQuotes();

    }else{
        loginPanel.style.display = "block";
        dashboardPanel.classList.remove("active");
    }

});

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginStatus.textContent = "";
    loginStatus.className = "admin-status";

    try{

        await signInWithEmailAndPassword(
            auth,
            loginEmail.value,
            loginPassword.value
        );

        loginStatus.textContent = "Login successful!";
        loginStatus.classList.add("success");

        loginForm.reset();

    }catch(error){

        loginStatus.textContent = `Login failed: ${error.code || error.message}`;
        loginStatus.classList.add("error");

        console.error(error);

    }

});

/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

/* =========================
   JOURNAL IMAGE PREVIEW
========================= */

articleImage.addEventListener("input", () => {
    showImagePreview(articleImage.value.trim());
});

/* =========================
   ADD / UPDATE JOURNAL ARTICLE
========================= */

articleForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    articleStatus.textContent = "";
    articleStatus.className = "admin-status";

    saveArticleBtn.disabled = true;
    saveArticleBtn.textContent = editingArticleId ? "Updating..." : "Saving...";

    const payload = {
        title: articleTitle.value.trim(),
        category: articleCategory.value.trim(),
        meta: articleMeta.value.trim(),
        imageUrl: articleImage.value.trim(),
        excerpt: articleExcerpt.value.trim(),
        content: articleContent.value.trim(),
        order: Number(articleOrder.value),
        published: articlePublished.checked,
        featured: articleFeatured.checked,
        updatedAt: serverTimestamp()
    };

    try{

        if(editingArticleId){

            await updateDoc(doc(db, "journal", editingArticleId), payload);

            if(payload.featured){
                await clearFeaturedExcept(editingArticleId);
            }

            articleStatus.textContent = "Article updated successfully!";
            articleStatus.classList.add("success");

        }else{

            payload.createdAt = serverTimestamp();

            const newArticleRef = await addDoc(collection(db, "journal"), payload);

            if(payload.featured){
                await clearFeaturedExcept(newArticleRef.id);
            }

            articleStatus.textContent = "Article saved successfully!";
            articleStatus.classList.add("success");

        }

        resetArticleForm();
        loadArticles();

    }catch(error){

        articleStatus.textContent = `Failed: ${error.code || error.message}`;
        articleStatus.className = "admin-status error";

        console.error("FULL FIREBASE ERROR:", error);

    }

    saveArticleBtn.disabled = false;
    saveArticleBtn.textContent = editingArticleId ? "Update Article" : "Save Article";

});

/* =========================
   LOAD JOURNAL ARTICLES
========================= */

async function loadArticles(){

    articleList.innerHTML = `
        <p class="empty-text">
            Loading articles...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "journal"));

        if(snapshot.empty){
            savedArticles = [];

            articleList.innerHTML = `
                <p class="empty-text">
                    No articles saved yet.
                </p>
            `;

            return;
        }

        savedArticles = [];

        snapshot.forEach((documentSnapshot) => {

            const article = documentSnapshot.data();

            savedArticles.push({
                id: documentSnapshot.id,
                title: article.title || "Untitled Article",
                category: article.category || "Journal",
                meta: article.meta || "Journal Entry",
                imageUrl: article.imageUrl || "",
                excerpt: article.excerpt || "",
                content: article.content || "",
                order: Number(article.order) || 999,
                published: article.published !== false,
                featured: article.featured === true
            });

        });

        savedArticles.sort((a, b) => {

            if(a.featured && !b.featured) return -1;
            if(!a.featured && b.featured) return 1;

            return a.order - b.order;

        });

        renderArticleList();

    }catch(error){

        articleList.innerHTML = `
            <p class="empty-text">
                Failed to load articles.
            </p>
        `;

        console.error(error);

    }

}

function renderArticleList(){

    articleList.innerHTML = "";

    savedArticles.forEach((article) => {

        const articleItem = document.createElement("div");
        articleItem.className = "saved-article";

        const imagePath = getAdminJournalImagePath(article.imageUrl);

        articleItem.innerHTML = `
            ${imagePath ? `
                <img class="saved-article-img" src="${escapeHTML(imagePath)}" alt="${escapeHTML(article.title)}">
            ` : ""}

            <span>
                ${escapeHTML(article.category)}
            </span>

            ${article.featured ? `<strong class="featured-badge">Featured</strong>` : ""}

            <h3>
                ${escapeHTML(article.title)}
            </h3>

            <p>
                ${escapeHTML(article.excerpt)}
            </p>

            <small>
                ${escapeHTML(article.meta)}
                • ${article.published ? "Published" : "Draft"}
                • Order ${article.order}
            </small>

            <div class="article-actions">
                <button class="edit-btn" data-id="${article.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${article.id}">
                    Delete
                </button>
            </div>
        `;

        articleList.appendChild(articleItem);

    });

    initEditButtons();
    initDeleteButtons();

}

function initEditButtons(){

    document.querySelectorAll(".edit-btn").forEach((button) => {

        button.addEventListener("click", () => {

            const articleId = button.dataset.id;
            const article = savedArticles.find(item => item.id === articleId);

            if(!article) return;

            editingArticleId = article.id;

            articleTitle.value = article.title;
            articleCategory.value = article.category;
            articleMeta.value = article.meta;
            articleImage.value = article.imageUrl;
            articleExcerpt.value = article.excerpt;
            articleContent.value = article.content;
            articleOrder.value = article.order;
            articlePublished.checked = article.published;
            articleFeatured.checked = article.featured;

            showImagePreview(article.imageUrl);

            formTitle.textContent = "Edit Journal Article";
            saveArticleBtn.textContent = "Update Article";
            cancelEditBtn.style.display = "block";

            articleStatus.textContent = "Editing article. Make changes and click Update Article.";
            articleStatus.className = "admin-status success";

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        });

    });

}

function initDeleteButtons(){

    document.querySelectorAll(".delete-btn").forEach((button) => {

        button.addEventListener("click", async () => {

            const articleId = button.dataset.id;

            const confirmDelete = confirm("Delete this article?");

            if(!confirmDelete) return;

            try{

                await deleteDoc(doc(db, "journal", articleId));

                if(editingArticleId === articleId){
                    resetArticleForm();
                }

                loadArticles();

            }catch(error){

                console.error(error);
                alert("Failed to delete article.");

            }

        });

    });

}

cancelEditBtn.addEventListener("click", () => {
    resetArticleForm();
});

async function clearFeaturedExcept(currentArticleId){

    const snapshot = await getDocs(collection(db, "journal"));

    const updateTasks = [];

    snapshot.forEach((documentSnapshot) => {

        if(documentSnapshot.id !== currentArticleId){

            updateTasks.push(
                updateDoc(doc(db, "journal", documentSnapshot.id), {
                    featured:false
                })
            );

        }

    });

    await Promise.all(updateTasks);

}

function resetArticleForm(){

    editingArticleId = null;

    articleForm.reset();

    articleImage.value = "";
    articleOrder.value = 1;
    articlePublished.checked = true;
    articleFeatured.checked = false;

    formTitle.textContent = "Add Journal Article";
    saveArticleBtn.textContent = "Save Article";
    cancelEditBtn.style.display = "none";

    imagePreview.innerHTML = `
        <p>No image selected</p>
    `;

}

function showImagePreview(imageUrl){

    const imagePath = getAdminJournalImagePath(imageUrl);

    if(!imagePath){
        imagePreview.innerHTML = `
            <p>No image selected</p>
        `;
        return;
    }

    imagePreview.innerHTML = `
        <img src="${escapeHTML(imagePath)}" alt="Article image preview">
        <p>${escapeHTML(imageUrl)}</p>
    `;

}

function getAdminJournalImagePath(imageUrl){

    if(!imageUrl) return "";

    if(imageUrl.startsWith("http")){
        return imageUrl;
    }

    if(imageUrl.startsWith("assets/")){
        return imageUrl;
    }

    if(imageUrl.startsWith("../")){
        return imageUrl.replace("../", "");
    }

    return `assets/images/journal/${imageUrl}`;

}

/* =========================
   GOALS MANAGER
========================= */

goalForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    goalStatus.textContent = "";
    goalStatus.className = "admin-status";

    saveGoalBtn.disabled = true;
    saveGoalBtn.textContent = editingGoalId ? "Updating..." : "Saving...";

    const payload = {
        title: goalTitle.value.trim(),
        category: goalCategory.value.trim(),
        year: goalYear.value.trim(),
        description: goalDescription.value.trim(),
        order: Number(goalOrder.value),
        published: goalPublished.checked,
        updatedAt: serverTimestamp()
    };

    try{

        if(editingGoalId){

            await updateDoc(doc(db, "goals", editingGoalId), payload);

            goalStatus.textContent = "Goal updated successfully!";
            goalStatus.classList.add("success");

        }else{

            payload.createdAt = serverTimestamp();

            await addDoc(collection(db, "goals"), payload);

            goalStatus.textContent = "Goal saved successfully!";
            goalStatus.classList.add("success");

        }

        resetGoalForm();
        loadGoals();

    }catch(error){

        goalStatus.textContent = `Failed: ${error.code || error.message}`;
        goalStatus.className = "admin-status error";

        console.error("FULL GOAL ERROR:", error);

    }

    saveGoalBtn.disabled = false;
    saveGoalBtn.textContent = editingGoalId ? "Update Goal" : "Save Goal";

});

async function loadGoals(){

    goalList.innerHTML = `
        <p class="empty-text">
            Loading goals...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "goals"));

        if(snapshot.empty){
            savedGoals = [];

            goalList.innerHTML = `
                <p class="empty-text">
                    No goals saved yet.
                </p>
            `;

            return;
        }

        savedGoals = [];

        snapshot.forEach((documentSnapshot) => {

            const goal = documentSnapshot.data();

            savedGoals.push({
                id: documentSnapshot.id,
                title: goal.title || "Untitled Goal",
                category: goal.category || "Goal",
                year: goal.year || "",
                description: goal.description || "",
                order: Number(goal.order) || 999,
                published: goal.published !== false
            });

        });

        savedGoals.sort((a, b) => a.order - b.order);

        renderGoalList();

    }catch(error){

        goalList.innerHTML = `
            <p class="empty-text">
                Failed to load goals.
            </p>
        `;

        console.error(error);

    }

}

function renderGoalList(){

    goalList.innerHTML = "";

    savedGoals.forEach((goal) => {

        const goalCard = document.createElement("div");
        goalCard.className = "saved-article";

        goalCard.innerHTML = `
            <span>${escapeHTML(goal.category)}</span>

            <h3>${escapeHTML(goal.title)}</h3>

            <p>${escapeHTML(goal.description)}</p>

            <small>
                ${escapeHTML(goal.year)}
                • ${goal.published ? "Published" : "Draft"}
                • Order ${goal.order}
            </small>

            <div class="article-actions">
                <button class="edit-goal-btn" data-id="${goal.id}">
                    Edit
                </button>

                <button class="delete-goal-btn" data-id="${goal.id}">
                    Delete
                </button>
            </div>
        `;

        goalList.appendChild(goalCard);

    });

    initGoalEditButtons();
    initGoalDeleteButtons();

}

function initGoalEditButtons(){

    document.querySelectorAll(".edit-goal-btn").forEach((button) => {

        button.addEventListener("click", () => {

            const goalId = button.dataset.id;
            const goal = savedGoals.find(item => item.id === goalId);

            if(!goal) return;

            editingGoalId = goal.id;

            goalTitle.value = goal.title;
            goalCategory.value = goal.category;
            goalYear.value = goal.year;
            goalDescription.value = goal.description;
            goalOrder.value = goal.order;
            goalPublished.checked = goal.published;

            goalFormTitle.textContent = "Edit Goal";
            saveGoalBtn.textContent = "Update Goal";
            cancelGoalEditBtn.style.display = "block";

            goalStatus.textContent = "Editing goal. Make changes and click Update.";
            goalStatus.className = "admin-status success";

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        });

    });

}

function initGoalDeleteButtons(){

    document.querySelectorAll(".delete-goal-btn").forEach((button) => {

        button.addEventListener("click", async () => {

            const goalId = button.dataset.id;

            const confirmDelete = confirm("Delete this goal?");

            if(!confirmDelete) return;

            try{

                await deleteDoc(doc(db, "goals", goalId));

                if(editingGoalId === goalId){
                    resetGoalForm();
                }

                loadGoals();

            }catch(error){

                console.error(error);
                alert("Failed to delete goal.");

            }

        });

    });

}

cancelGoalEditBtn.addEventListener("click", () => {
    resetGoalForm();
});

function resetGoalForm(){

    editingGoalId = null;

    goalForm.reset();

    goalOrder.value = 1;
    goalPublished.checked = true;

    goalFormTitle.textContent = "Add Goal";
    saveGoalBtn.textContent = "Save Goal";
    cancelGoalEditBtn.style.display = "none";

}

/* =========================
   QUOTES MANAGER
========================= */

quoteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    quoteStatus.textContent = "";
    quoteStatus.className = "admin-status";

    saveQuoteBtn.disabled = true;
    saveQuoteBtn.textContent = editingQuoteId ? "Updating..." : "Saving...";

    const payload = {
        quote: quoteText.value.trim(),
        author: quoteAuthor.value.trim(),
        category: quoteCategory.value.trim(),
        order: Number(quoteOrder.value),
        published: quotePublished.checked,
        featured: quoteFeatured.checked,
        updatedAt: serverTimestamp()
    };

    try{

        if(editingQuoteId){

            await updateDoc(doc(db, "quotes", editingQuoteId), payload);

            if(payload.featured){
                await clearFeaturedQuotesExcept(editingQuoteId);
            }

            quoteStatus.textContent = "Quote updated successfully!";
            quoteStatus.classList.add("success");

        }else{

            payload.createdAt = serverTimestamp();

            const newQuoteRef = await addDoc(collection(db, "quotes"), payload);

            if(payload.featured){
                await clearFeaturedQuotesExcept(newQuoteRef.id);
            }

            quoteStatus.textContent = "Quote saved successfully!";
            quoteStatus.classList.add("success");

        }

        resetQuoteForm();
        loadQuotes();

    }catch(error){

        quoteStatus.textContent = `Failed: ${error.code || error.message}`;
        quoteStatus.className = "admin-status error";

        console.error("FULL QUOTE ERROR:", error);

    }

    saveQuoteBtn.disabled = false;
    saveQuoteBtn.textContent = editingQuoteId ? "Update Quote" : "Save Quote";

});

async function loadQuotes(){

    quoteListAdmin.innerHTML = `
        <p class="empty-text">
            Loading quotes...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "quotes"));

        if(snapshot.empty){
            savedQuotes = [];

            quoteListAdmin.innerHTML = `
                <p class="empty-text">
                    No quotes saved yet.
                </p>
            `;

            return;
        }

        savedQuotes = [];

        snapshot.forEach((documentSnapshot) => {

            const quote = documentSnapshot.data();

            savedQuotes.push({
                id: documentSnapshot.id,
                quote: quote.quote || "",
                author: quote.author || "Norqhalif",
                category: quote.category || "Quote",
                order: Number(quote.order) || 999,
                published: quote.published !== false,
                featured: quote.featured === true
            });

        });

        savedQuotes.sort((a, b) => {

            if(a.featured && !b.featured) return -1;
            if(!a.featured && b.featured) return 1;

            return a.order - b.order;

        });

        renderQuoteList();

    }catch(error){

        quoteListAdmin.innerHTML = `
            <p class="empty-text">
                Failed to load quotes.
            </p>
        `;

        console.error(error);

    }

}

function renderQuoteList(){

    quoteListAdmin.innerHTML = "";

    savedQuotes.forEach((quote) => {

        const quoteCard = document.createElement("div");
        quoteCard.className = "saved-article";

        quoteCard.innerHTML = `
            <span>${escapeHTML(quote.category)}</span>

            ${quote.featured ? `<strong class="featured-badge">Featured</strong>` : ""}

            <h3>“${escapeHTML(quote.quote)}”</h3>

            <p>— ${escapeHTML(quote.author)}</p>

            <small>
                ${quote.published ? "Published" : "Draft"}
                • Order ${quote.order}
            </small>

            <div class="article-actions">
                <button class="edit-quote-btn" data-id="${quote.id}">
                    Edit
                </button>

                <button class="delete-quote-btn" data-id="${quote.id}">
                    Delete
                </button>
            </div>
        `;

        quoteListAdmin.appendChild(quoteCard);

    });

    initQuoteEditButtons();
    initQuoteDeleteButtons();

}

function initQuoteEditButtons(){

    document.querySelectorAll(".edit-quote-btn").forEach((button) => {

        button.addEventListener("click", () => {

            const quoteId = button.dataset.id;
            const quote = savedQuotes.find(item => item.id === quoteId);

            if(!quote) return;

            editingQuoteId = quote.id;

            quoteText.value = quote.quote;
            quoteAuthor.value = quote.author;
            quoteCategory.value = quote.category;
            quoteOrder.value = quote.order;
            quotePublished.checked = quote.published;
            quoteFeatured.checked = quote.featured;

            quoteFormTitle.textContent = "Edit Quote";
            saveQuoteBtn.textContent = "Update Quote";
            cancelQuoteEditBtn.style.display = "block";

            quoteStatus.textContent = "Editing quote. Make changes and click Update.";
            quoteStatus.className = "admin-status success";

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        });

    });

}

function initQuoteDeleteButtons(){

    document.querySelectorAll(".delete-quote-btn").forEach((button) => {

        button.addEventListener("click", async () => {

            const quoteId = button.dataset.id;

            const confirmDelete = confirm("Delete this quote?");

            if(!confirmDelete) return;

            try{

                await deleteDoc(doc(db, "quotes", quoteId));

                if(editingQuoteId === quoteId){
                    resetQuoteForm();
                }

                loadQuotes();

            }catch(error){

                console.error(error);
                alert("Failed to delete quote.");

            }

        });

    });

}

cancelQuoteEditBtn.addEventListener("click", () => {
    resetQuoteForm();
});

function resetQuoteForm(){

    editingQuoteId = null;

    quoteForm.reset();

    quoteAuthor.value = "Norqhalif";
    quoteOrder.value = 1;
    quotePublished.checked = true;
    quoteFeatured.checked = false;

    quoteFormTitle.textContent = "Add Quote";
    saveQuoteBtn.textContent = "Save Quote";
    cancelQuoteEditBtn.style.display = "none";

}

async function clearFeaturedQuotesExcept(currentQuoteId){

    const snapshot = await getDocs(collection(db, "quotes"));

    const updateTasks = [];

    snapshot.forEach((documentSnapshot) => {

        if(documentSnapshot.id !== currentQuoteId){

            updateTasks.push(
                updateDoc(doc(db, "quotes", documentSnapshot.id), {
                    featured:false
                })
            );

        }

    });

    await Promise.all(updateTasks);

}

/* =========================
   HELPERS
========================= */

function escapeHTML(text){

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}