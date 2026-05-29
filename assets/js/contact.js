/* =========================
   CONTACT PAGE TEMPORARY FORM
   Use before website is published
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".contact-form");
    const status = document.getElementById("formStatus");

    if(!form || !status) return;

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        status.textContent = "Thanks! This form will be activated once the website is published.";
        status.className = "form-status success";

        form.reset();

    });

});