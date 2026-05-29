/* =========================
   GOALS PAGE
   Firebase Goal Cards
========================= */

import {
    db,
    collection,
    getDocs
} from "./firebase.js";

const fallbackGoals = [
    {
        id: "career",
        title: "Technology Career",
        category: "Career",
        year: "2030+",
        description: "Build a meaningful career in software development and digital innovation.",
        order: 1
    },
    {
        id: "growth",
        title: "Continuous Growth",
        category: "Personal",
        year: "Ongoing",
        description: "Continue learning, improving and becoming better professionally and personally.",
        order: 2
    }
];

document.addEventListener("DOMContentLoaded", () => {
    loadGoals();
});

async function loadGoals(){

    const goalsGrid = document.getElementById("goalsGrid");

    if(!goalsGrid) return;

    goalsGrid.innerHTML = `
        <p class="goal-loading">
            Loading goals...
        </p>
    `;

    try{

        const snapshot = await getDocs(collection(db, "goals"));

        let goals = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if(data.published === false) return;

            goals.push({
                id: docSnap.id,
                title: data.title || "Untitled Goal",
                category: data.category || "Goal",
                year: data.year || "",
                description: data.description || "",
                order: Number(data.order) || 999
            });

        });

        if(goals.length === 0){
            goals = fallbackGoals;
        }

        goals.sort((a, b) => a.order - b.order);

        renderGoals(goals);

    }catch(error){

        console.error("Firebase goals load failed. Using fallback goals.", error);

        const goals = [...fallbackGoals];

        goals.sort((a, b) => a.order - b.order);

        renderGoals(goals);

    }

}

function renderGoals(goals){

    const goalsGrid = document.getElementById("goalsGrid");

    goalsGrid.innerHTML = "";

    goals.forEach((goal) => {

        const card = document.createElement("div");
        card.className = "dream-card";

        card.innerHTML = `
            <span class="goal-year">
                ${escapeHTML(goal.year)}
            </span>

            <h3>
                ${escapeHTML(goal.title)}
            </h3>

            <p>
                ${escapeHTML(goal.description)}
            </p>

            <small class="goal-category">
                ${escapeHTML(goal.category)}
            </small>
        `;

        goalsGrid.appendChild(card);

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