const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

// ========= AUDIO =========
const bgm = new Audio("assets/music.mp3");
bgm.loop = true;
let musicOn = true;

// ========= PLAYER DATA =========
let save = JSON.parse(localStorage.getItem("runnerSave")) || {
  coins: 0,
  character: 0,
  owned: [0]
};

const characters = [
  {color:"#ff5722"},
  {color:"#4caf50"},
  {color:"#2196f3"},
  {color:"#9c27b0"},
  {color:"#ff9800"},
  {color:"#00bcd4"},
  {color:"#8bc34a"},
  {color:"#e91e63"},
  {color:"#3f51b5"},
  {color:"#ffc107"},
  {color:"#795548"},
  {color:"#607d8b"}
];

let running=false,score=0,coins=0,speed=4;
let obstacles=[],coinDrops=[];

// ========= UI =========
function updateUI(){
  document.getElementById("coinUI").innerText="🪙 "+save.coins;
  document.getElementById("scoreUI").innerText="Score "+score;
}

// ========= SHOP =========
function openShop(){
  document.getElementById("menu").style.display="none";
  document.getElementById("shop").style.display="flex";
  const shop=document.getElementById("shopItems");
  shop.innerHTML="";
  characters.forEach((c,i)=>{
    const owned=save.owned.includes(i);
    const div=document.createElement("div");
    div.className="shopItem";
    div.innerHTML=`
      <div style="width:30px;height:30px;background:${c.color};margin:auto"></div>
      <p>${owned?"Owned":"Cost 50"}</p>
      <button>${owned?"Select":"Buy"}</button>
    `;
    div.querySelector("button").onclick=()=>{
      if(!owned && save.coins>=50){
        save.coins-=50;
        save.owned.push(i);
      }
      if(save.owned.includes(i)) save.character=i;
      saveData();
      openShop();
    };
    shop.appendChild(div);
  });
}

function closeShop(){
  document.getElementById("shop").style.display="none";
  document.getElementById("menu").style.display="flex";
}

// ========= GAME =========
const player={
  x:canvas.width/2,y:canvas.height-120,vy:0
};

function startGame(){
  document.getElementById("menu").style.display="none";
  if(musicOn) bgm.play();
  running=true;score=0;coins=0;speed=4;
  obstacles=[];coinDrops=[];
  loop();
}

function loop(){
  if(!running) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ground
  ctx.fillStyle="#4caf50";
  ctx.fillRect(0,canvas.height-60,canvas.width,60);

  // player
  player.vy+=0.8;
  player.y+=player.vy;
  if(player.y>canvas.height-120){player.y=canvas.height-120;player.vy=0;}
  ctx.fillStyle=characters[save.character].color;
  ctx.fillRect(player.x-20,player.y,40,40);

  // obstacles
  if(Math.random()<0.02){
    obstacles.push({x:Math.random()*canvas.width,y:-40});
    coinDrops.push({x:Math.random()*canvas.width,y:-100});
  }

  obstacles.forEach(o=>{
    o.y+=speed;
    ctx.fillStyle="#3f51b5";
    ctx.fillRect(o.x,o.y,40,40);
    if(Math.abs(o.x-player.x)<30 && Math.abs(o.y-player.y)<30) endGame();
  });

  coinDrops.forEach((c,i)=>{
    c.y+=speed;
    ctx.fillStyle="gold";
    ctx.beginPath();
    ctx.arc(c.x,c.y,8,0,Math.PI*2);
    ctx.fill();
    if(Math.abs(c.x-player.x)<20 && Math.abs(c.y-player.y)<20){
      save.coins++; coinDrops.splice(i,1); saveData();
    }
  });

  score++; if(score%500==0) speed+=0.5;
  updateUI();
  requestAnimationFrame(loop);
}

function endGame(){
  running=false;
  bgm.pause();
  document.getElementById("finalText").innerText=
    `Score ${score}\nCoins +${Math.floor(score/50)}`;
  save.coins+=Math.floor(score/50);
  saveData();
  document.getElementById("gameover").style.display="flex";
}

function restart(){
  document.getElementById("gameover").style.display="none";
  startGame();
}

function toggleMusic(){
  musicOn=!musicOn;
  if(!musicOn) bgm.pause();
}

// ========= SAVE =========
function saveData(){
  localStorage.setItem("runnerSave",JSON.stringify(save));
  updateUI();
}

canvas.addEventListener("touchstart",()=>player.vy=-15);
window.addEventListener("keydown",e=>{if(e.code==="Space")player.vy=-15});

updateUI();
