const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

/* ===== SAVE DATA ===== */
let save = JSON.parse(localStorage.getItem("runnerSave")) || {
  coins: 0,
  character: 0,
  owned: [0],
  dailyDone: ""
};

/* ===== CHARACTERS & SKILLS ===== */
const characters = [
  { name:"Runner", color:"#ff5722", jump:1, coin:1, score:1, shield:false },
  { name:"Speedy", color:"#4caf50", jump:1, coin:1, score:1.2, shield:false },
  { name:"Jumper", color:"#2196f3", jump:1.3, coin:1, score:1, shield:false },
  { name:"Collector", color:"#ffc107", jump:1, coin:1.5, score:1, shield:false },
  { name:"Shield", color:"#9c27b0", jump:1, coin:1, score:1, shield:true },
  { name:"Lucky", color:"#00bcd4", jump:1, coin:2, score:0.8, shield:false },
  { name:"Pro", color:"#e91e63", jump:1, coin:1, score:1.5, shield:false },
  { name:"Heavy", color:"#795548", jump:0.9, coin:1, score:1.2, shield:false },
  { name:"Ghost", color:"#607d8b", jump:1, coin:1, score:1, shield:true },
  { name:"Chaos", color:"#8bc34a", jump:Math.random()*0.5+0.8, coin:1, score:1, shield:false },
  { name:"Sprinter", color:"#ff9800", jump:1, coin:1, score:1.3, shield:false },
  { name:"Ninja", color:"#3f51b5", jump:1.1, coin:1, score:1.1, shield:false }
];

/* ===== DAILY CHALLENGE ===== */
const today = new Date().toDateString();
let daily = JSON.parse(localStorage.getItem("daily")) || {
  date: today,
  targetScore: Math.floor(Math.random()*1000)+1000,
  reward: 200
};

if (daily.date !== today) {
  daily = {
    date: today,
    targetScore: Math.floor(Math.random()*1000)+1000,
    reward: 200
  };
  save.dailyDone = "";
}

localStorage.setItem("daily", JSON.stringify(daily));

/* ===== GAME STATE ===== */
let running=false, score=0, speed=4;
let obstacles=[], coins=[];
let shieldUsed=false;

const player = {
  x: canvas.width/2,
  y: canvas.height-120,
  vy: 0
};

/* ===== GAME LOOP ===== */
function startGame(){
  running=true;
  score=0;
  speed=4;
  obstacles=[];
  coins=[];
  shieldUsed=false;
  document.getElementById("menu").style.display="none";
  loop();
}

function loop(){
  if(!running) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ground
  ctx.fillStyle="#4caf50";
  ctx.fillRect(0,canvas.height-60,canvas.width,60);

  // player physics
  player.vy += 0.8;
  player.y += player.vy;
  if(player.y>canvas.height-120){player.y=canvas.height-120;player.vy=0;}

  const char = characters[save.character];

  // draw player
  ctx.fillStyle = char.color;
  ctx.fillRect(player.x-20,player.y,40,40);

  // spawn
  if(Math.random()<0.025){
    obstacles.push({x:Math.random()*canvas.width,y:-40});
    coins.push({x:Math.random()*canvas.width,y:-80});
  }

  // obstacles
  obstacles.forEach((o,i)=>{
    o.y+=speed;
    ctx.fillStyle="#3f51b5";
    ctx.fillRect(o.x,o.y,40,40);

    if(Math.abs(o.x-player.x)<30 && Math.abs(o.y-player.y)<30){
      if(char.shield && !shieldUsed){
        shieldUsed=true;
        obstacles.splice(i,1);
      } else {
        endGame();
      }
    }
  });

  // coins
  coins.forEach((c,i)=>{
    c.y+=speed;
    ctx.fillStyle="gold";
    ctx.beginPath();
    ctx.arc(c.x,c.y,8,0,Math.PI*2);
    ctx.fill();

    if(Math.abs(c.x-player.x)<20 && Math.abs(c.y-player.y)<20){
      save.coins += Math.floor(1 * char.coin);
      coins.splice(i,1);
      saveData();
    }
  });

  score += char.score;
  if(score % 500 < 5) speed += 0.4;

  requestAnimationFrame(loop);
}

function endGame(){
  running=false;

  // daily challenge check
  if(score >= daily.targetScore && save.dailyDone !== today){
    save.coins += daily.reward;
    save.dailyDone = today;
    alert("Daily Challenge Completed! +" + daily.reward + " coins");
  }

  saveData();
  document.getElementById("gameover").style.display="flex";
  document.getElementById("finalText").innerText =
    `Score: ${Math.floor(score)}\nCoins: ${save.coins}\nDaily Target: ${daily.targetScore}`;
}

/* ===== CONTROLS ===== */
canvas.addEventListener("touchstart",()=>player.vy=-15 * characters[save.character].jump);
window.addEventListener("keydown",e=>{
  if(e.code==="Space") player.vy=-15 * characters[save.character].jump;
});

/* ===== SAVE ===== */
function saveData(){
  localStorage.setItem("runnerSave",JSON.stringify(save));
}
