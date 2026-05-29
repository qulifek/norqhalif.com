document.addEventListener("DOMContentLoaded", () => {

initNavbar();
initReveal();

});

function initNavbar(){

const navbar =
document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY > 50){

navbar.classList.add("scrolled");

}else{

navbar.classList.remove("scrolled");

}

});

}

function initReveal(){

const reveals =
document.querySelectorAll(".reveal");

const observer =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{
threshold:.15
});

reveals.forEach(item=>{

observer.observe(item);

});

}