/* =========================
   QUOTES PAGE
   Firebase Quotes
========================= */

import {
    db,
    collection,
    getDocs
} from "./firebase.js";

const fallbackQuotes = [
    {
        id: "growth",
        quote: "Growth begins where comfort ends.",
        author: "Norqhalif",
        category: "Growth",
        featured: true,
        order: 1
    },
    {
        id: "discipline",
        quote: "Discipline will take you places motivation cannot.",
        author: "Norqhalif",
        category: "Discipline",
        featured: false,
        order: 2
    }
];

document.addEventListener("DOMContentLoaded", () => {
    loadQuotes();
});

async function loadQuotes(){

    const quoteList = document.getElementById("quoteList");

    if(!quoteList) return;

    quoteList.innerHTML = `
        <p class="quote-loading">
            Loading quotes...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "quotes"));

        let quotes = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if(data.published === false) return;

            quotes.push({
                id: docSnap.id,
                quote: data.quote || "",
                author: data.author || "Norqhalif",
                category: data.category || "Quote",
                featured: data.featured === true,
                order: Number(data.order) || 999
            });

        });

        if(quotes.length === 0){
            quotes = fallbackQuotes;
        }

        quotes.sort((a, b) => {

            if(a.featured && !b.featured) return -1;
            if(!a.featured && b.featured) return 1;

            return a.order - b.order;

        });

        renderFeaturedQuote(quotes);
        renderQuoteList(quotes);

    }catch(error){

        console.error("Firebase quotes load failed. Using fallback quotes.", error);

        const quotes = [...fallbackQuotes];

        renderFeaturedQuote(quotes);
        renderQuoteList(quotes);

    }

}

function renderFeaturedQuote(quotes){

    const featuredQuote = document.getElementById("featuredQuote");
    const featuredQuoteAuthor = document.getElementById("featuredQuoteAuthor");

    const selectedQuote =
        quotes.find(item => item.featured === true) || quotes[0];

    if(!selectedQuote) return;

    if(featuredQuote){
        featuredQuote.textContent = `"${selectedQuote.quote}"`;
    }

    if(featuredQuoteAuthor){
        featuredQuoteAuthor.textContent = `— ${selectedQuote.author}`;
    }

}

function renderQuoteList(quotes){

    const quoteList = document.getElementById("quoteList");

    quoteList.innerHTML = "";

    quotes.forEach((item) => {

        const card = document.createElement("div");
        card.className = "quote-card";

        card.innerHTML = `
            "${escapeHTML(item.quote)}"
        `;

        quoteList.appendChild(card);

    });

}

function escapeHTML(text){

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}