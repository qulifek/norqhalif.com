/* =========================
   NORQHALIF PORTFOLIO
   GLOBAL SCRIPT
========================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileNavbar();
    initScrollReveal();
    initBackToTopButton();
    initActiveNavLink();

});

/* =========================
   MOBILE NAVBAR
========================= */

function toggleMenu(){
    const navLinks = document.getElementById("navLinks");
    const menuButton = document.querySelector(".menu-toggle");

    if(!navLinks || !menuButton) return;

    navLinks.classList.toggle("active");

    if(navLinks.classList.contains("active")){
        menuButton.innerHTML = "×";
    }else{
        menuButton.innerHTML = "☰";
    }
}

function initMobileNavbar(){
    const navLinks = document.getElementById("navLinks");
    const menuButton = document.querySelector(".menu-toggle");

    if(!navLinks || !menuButton) return;

    const links = navLinks.querySelectorAll("a");

    links.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuButton.innerHTML = "☰";
        });
    });
}

/* =========================
   SCROLL REVEAL
========================= */

function initScrollReveal(){
    const revealElements = document.querySelectorAll(
        "section, .stat-card, .feature-card, .timeline-item, .education-card, .achievement-card, .gallery-item, .journal-card, .dream-card, .art-card, .principle-card, .quick-card, .collab-card"
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold:0.12
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

/* =========================
   BACK TO TOP BUTTON
========================= */

function initBackToTopButton(){
    const topButton = document.createElement("button");

    topButton.className = "top-btn";
    topButton.innerHTML = "↑";
    topButton.setAttribute("aria-label", "Back to top");

    document.body.appendChild(topButton);

    topButton.style.opacity = "0";
    topButton.style.pointerEvents = "none";

    window.addEventListener("scroll", () => {
        if(window.scrollY > 150){
            topButton.style.opacity = "1";
            topButton.style.pointerEvents = "auto";
        }else{
            topButton.style.opacity = "0";
            topButton.style.pointerEvents = "none";
        }
    });

    topButton.addEventListener("click", () => {
        window.scrollTo({
            top:0,
            behavior:"smooth"
        });
    });
}

/* =========================
   ACTIVE NAV LINK
========================= */

function initActiveNavLink(){
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();

        if(linkPage === currentPage){
            link.classList.add("active");
        }
    });
}

/* =========================
   COPY TEXT HELPER
========================= */

function copyText(text){
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard!");
    }).catch(() => {
        showToast("Copy failed. Please try manually.");
    });
}

/* =========================
   TOAST MESSAGE
========================= */

function showToast(message){
    let toast = document.querySelector(".toast-message");

    if(!toast){
        toast = document.createElement("div");
        toast.className = "toast-message";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}