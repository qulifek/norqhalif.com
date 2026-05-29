const canvas =
document.getElementById("particles");

if(canvas){

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

const particles=[];

for(let i=0;i<100;i++){

particles.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

size:Math.random()*3,

speedX:(Math.random()-.5),

speedY:(Math.random()-.5)

});

}

function animate(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

particles.forEach(p=>{

p.x += p.speedX;
p.y += p.speedY;

if(p.x<0||p.x>canvas.width)
p.speedX*=-1;

if(p.y<0||p.y>canvas.height)
p.speedY*=-1;

ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.size,
0,
Math.PI*2
);

ctx.fillStyle=
"rgba(0,217,255,.7)";

ctx.fill();

});

requestAnimationFrame(
animate
);

}

animate();

}

