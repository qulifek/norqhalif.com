/* =========================
   JOURNAL PAGE
   Firebase + Featured + Images + Search + Modal
========================= */

import {
    db,
    collection,
    getDocs
} from "./firebase.js";

let articleStore = {};

const fallbackArticles = [
    {
        id: "president",
        category: "Leadership",
        title: "Becoming President of the Computer Science Association",
        meta: "May 2026 • 5 min read",
        imageUrl: "",
        excerpt: "The challenges, responsibilities and valuable lessons learned while leading a student organisation.",
        content: `
Becoming President of the Computer Science Association was one of the most meaningful responsibilities in my student journey.

Through this role, I learned how important communication, teamwork and responsibility are when managing people and programmes.

This experience helped me grow as a student leader and reminded me that leadership is built through action, consistency and willingness to serve others.
        `,
        order: 1,
        featured: true,
        createdAt: null
    }
];

document.addEventListener("DOMContentLoaded", () => {
    loadJournalArticles();
});

async function loadJournalArticles(){

    const journalGrid = document.getElementById("journalGrid");

    if(!journalGrid) return;

    journalGrid.innerHTML = `
        <p class="journal-loading">
            Loading journal entries...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "journal"));

        let articles = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if(data.published === false) return;

            articles.push({
                id: docSnap.id,
                category: data.category || "Journal",
                title: data.title || "Untitled Article",
                meta: data.meta || "Journal Entry",
                imageUrl: data.imageUrl || "",
                excerpt: data.excerpt || "",
                content: data.content || "",
                order: Number(data.order) || 999,
                featured: data.featured === true,
                createdAt: data.createdAt || null
            });

        });

        if(articles.length === 0){
            articles = fallbackArticles;
        }

        sortArticles(articles);
        renderArticles(articles);

        const featuredArticle =
            articles.find(article => article.featured === true) || articles[0];

        updateFeaturedArticle(featuredArticle);

        initJournalSearch();
        initArticleModal();

    }catch(error){

        console.error("Firebase journal load failed. Using fallback articles.", error);

        const articles = [...fallbackArticles];

        sortArticles(articles);
        renderArticles(articles);

        const featuredArticle =
            articles.find(article => article.featured === true) || articles[0];

        updateFeaturedArticle(featuredArticle);

        initJournalSearch();
        initArticleModal();

    }

}

function sortArticles(articles){

    articles.sort((a, b) => {

        if(a.featured && !b.featured) return -1;
        if(!a.featured && b.featured) return 1;

        const timeA = getArticleTime(a);
        const timeB = getArticleTime(b);

        if(timeA !== timeB){
            return timeB - timeA;
        }

        return a.order - b.order;

    });

}

function renderArticles(articles){

    const journalGrid = document.getElementById("journalGrid");

    if(!journalGrid) return;

    articleStore = {};
    journalGrid.innerHTML = "";

    articles.forEach((article) => {

        const imagePath = getJournalImagePath(article.imageUrl);

        articleStore[article.id] = {
            category: article.category,
            title: article.title,
            meta: article.meta,
            imageUrl: imagePath,
            excerpt: article.excerpt,
            body: formatArticleContent(article.content)
        };

        const card = document.createElement("div");
        card.className = "journal-card";

        card.innerHTML = `
            ${imagePath ? `
                <img class="journal-card-image" src="${escapeHTML(imagePath)}" alt="${escapeHTML(article.title)}">
            ` : ""}

            <div class="journal-tag">
                ${escapeHTML(article.category)}
            </div>

            <h2>
                ${escapeHTML(article.title)}
            </h2>

            <p>
                ${escapeHTML(article.excerpt)}
            </p>

            <div class="journal-meta">
                ${escapeHTML(article.meta)}
            </div>

            <a href="#" class="read-article" data-article="${article.id}">
                Read Article →
            </a>
        `;

        journalGrid.appendChild(card);

    });

}

function updateFeaturedArticle(article){

    if(!article) return;

    const imagePath = getJournalImagePath(article.imageUrl);

    const featuredContent = document.querySelector(".featured-content");
    const featuredCategory = document.getElementById("featuredCategory");
    const featuredTitle = document.getElementById("featuredTitle");
    const featuredExcerpt = document.getElementById("featuredExcerpt");
    const featuredMeta = document.getElementById("featuredMeta");
    const featuredReadBtn = document.getElementById("featuredReadBtn");

    if(featuredContent){
        const oldImage = featuredContent.querySelector(".featured-journal-image");
        if(oldImage) oldImage.remove();

        if(imagePath){
            const img = document.createElement("img");
            img.className = "featured-journal-image";
            img.src = imagePath;
            img.alt = article.title;
            featuredContent.prepend(img);
        }
    }

    if(featuredCategory) featuredCategory.textContent = "Featured Reflection";
    if(featuredTitle) featuredTitle.textContent = article.title;
    if(featuredExcerpt) featuredExcerpt.textContent = article.excerpt;
    if(featuredMeta) featuredMeta.textContent = article.meta;

    if(featuredReadBtn){
        featuredReadBtn.dataset.article = article.id;
    }

}

function initJournalSearch(){

    const searchInput = document.getElementById("searchInput");
    const noResults = document.getElementById("noResults");

    if(!searchInput) return;

    searchInput.addEventListener("input", () => {

        const searchValue = searchInput.value.toLowerCase().trim();
        const journalCards = document.querySelectorAll(".journal-card");

        let visibleCount = 0;

        journalCards.forEach((card) => {

            const cardText = card.innerText.toLowerCase();

            if(cardText.includes(searchValue)){
                card.style.display = "block";
                visibleCount++;
            }else{
                card.style.display = "none";
            }

        });

        if(noResults){
            noResults.style.display = visibleCount === 0 ? "block" : "none";
        }

    });

}

function initArticleModal(){

    const modal = document.getElementById("articleModal");
    const closeBtn = document.getElementById("articleClose");

    const articleCategory = document.getElementById("articleCategory");
    const articleTitle = document.getElementById("articleTitle");
    const articleMeta = document.getElementById("articleMeta");
    const articleBody = document.getElementById("articleBody");

    if(!modal || !closeBtn) return;

    document.addEventListener("click", (event) => {

        const button = event.target.closest(".read-article");

        if(!button) return;

        event.preventDefault();

        const articleKey = button.dataset.article;
        const article = articleStore[articleKey];

        if(!article) return;

        if(articleCategory) articleCategory.textContent = article.category;
        if(articleTitle) articleTitle.textContent = article.title;
        if(articleMeta) articleMeta.textContent = article.meta;

        if(articleBody){
            articleBody.innerHTML = `
                ${article.imageUrl ? `
                    <img class="article-modal-image" src="${escapeHTML(article.imageUrl)}" alt="${escapeHTML(article.title)}">
                ` : ""}
                ${article.body}
            `;
        }

        modal.classList.add("active");
        document.body.style.overflow = "hidden";

    });

    closeBtn.addEventListener("click", closeArticle);

    modal.addEventListener("click", (event) => {
        if(event.target === modal){
            closeArticle();
        }
    });

    document.addEventListener("keydown", (event) => {
        if(event.key === "Escape" && modal.classList.contains("active")){
            closeArticle();
        }
    });

    function closeArticle(){
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }

}

function getJournalImagePath(imageUrl){

    if(!imageUrl) return "";

    if(imageUrl.startsWith("http")){
        return imageUrl;
    }

    if(imageUrl.startsWith("../")){
        return imageUrl;
    }

    if(imageUrl.startsWith("assets/")){
        return `../${imageUrl}`;
    }

    return `../assets/images/journal/${imageUrl}`;

}

function formatArticleContent(content){

    if(!content){
        return "<p>No content available.</p>";
    }

    return String(content)
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p>${escapeHTML(paragraph)}</p>`)
        .join("");

}

function escapeHTML(text){

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function getArticleTime(article){

    if(article.createdAt && typeof article.createdAt.toMillis === "function"){
        return article.createdAt.toMillis();
    }

    return 0;

}