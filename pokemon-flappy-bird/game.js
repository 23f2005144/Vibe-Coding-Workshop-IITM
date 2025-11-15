// Simple Pokemon Flappy Bird Game

// Ensure these images exist in assets/ as described in README!
const pikachuImg = new Image();
pikachuImg.src = "assets/pikachu.png";
const rocketImg = new Image();
rocketImg.src = "assets/team-rocket.png";
const pokeballImg = new Image();
pokeballImg.src = "assets/pokeball.png";
const berryImg = new Image();
berryImg.src = "assets/berry.png";

// Soundtrack
const AUDIO_FILE = "assets/pokemon-theme.mp3";

function setupGameUI() {
  // Add score, canvas, restart button, bgm audio tag
  if (!document.getElementById('gameCanvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = "gameCanvas";
    canvas.width = 400;
    canvas.height = 600;
    document.body.appendChild(canvas);
  }
  if (!document.getElementById('score')) {
    const scoreDiv = document.createElement('div');
    scoreDiv.id = "score";
    scoreDiv.textContent = 'Score: 0';
    document.body.appendChild(scoreDiv);
  }
  if (!document.getElementById('restartBtn')) {
    const btn = document.createElement('button');
    btn.id = "restartBtn";
    btn.textContent = "Restart";
    btn.style.display = "none";
    document.body.appendChild(btn);
  }
  if (!document.getElementById('bgm')) {
    const audio = document.createElement('audio');
    audio.id = "bgm";
    audio.loop = true;
    audio.autoplay = true;
    audio.innerHTML = `<source src="${AUDIO_FILE}" type="audio/mp3" />Your browser does not support the audio tag.`;
    document.body.appendChild(audio);
  }
}

setupGameUI();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDiv = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const audio = document.getElementById("bgm");

const gameW = canvas.width, gameH = canvas.height;

function randInt(min, max) { return Math.floor(Math.random() * (max-min+1)+min); }

let state, player, pipes, items, score, velocity, audioPlayed, gravity, gameSpeed;

function resetGameVars() {
  state = "playing";
  player = {
    x: 60, y: 250, w: 40, h: 40,
    velocity: 0,
    img: pikachuImg
  };
  pipes = [];
  items = [];
  score = 0;
  velocity = 0;
  gravity = 0.38;
  gameSpeed = 2.2;
  audioPlayed = false;

  // Create first pipes
  for (let i = 0; i < 3; i++) addPipe(300 + i*200);
}

function addPipe(x) {
  let gap = randInt(110, 160);
  let topH = randInt(60, gameH - 180 - gap);
  pipes.push({
    x: x, w: 54, top: topH, gap: gap,
    scored: false
  });
  // 50% chance to add coin or berry
  if (Math.random() < 0.5) {
    let iy = topH + gap/2 - 18;
    let itemType = Math.random() < 0.5 ? "pokeball" : "berry";
    items.push({x: x+32, y: iy, type: itemType, collected: false});
  }
}

function collideBox(a, b) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function draw() {
  ctx.clearRect(0, 0, gameW, gameH);

  // Draw background clouds (optional)
  ctx.fillStyle = "#deeefa";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(70 + i*80, 70 + Math.sin(Date.now()/1100 + i)*10, 28, 0, 2*Math.PI);
    ctx.arc(105 + i*80, 80 + Math.sin(Date.now()/900 + i)*8, 14, 0, 2*Math.PI);
    ctx.fill();
  }

  // Draw pipes (Team Rocket)
  for (const pipe of pipes) {
    // Top rocket
    ctx.drawImage(rocketImg, pipe.x, 0, pipe.w, pipe.top);
    // Bottom rocket
    ctx.drawImage(rocketImg, pipe.x, pipe.top + pipe.gap, pipe.w, gameH - (pipe.top + pipe.gap));
  }

  // Draw items
  for (const item of items) {
    if (!item.collected) {
      let img = item.type === "pokeball" ? pokeballImg : berryImg;
      ctx.drawImage(img, item.x, item.y, 32, 32);
    }
  }

  // Draw Pikachu
  ctx.drawImage(player.img, player.x, player.y, player.w, player.h);

  // Draw score
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#222";
  ctx.textAlign = "right";
  ctx.fillText(score, gameW - 20, 50);
}

function update() {
  if (state !== "playing") return;

  // Gravity
  player.velocity += gravity;
  player.y += player.velocity;

  // Pipe movement
  for (const pipe of pipes) pipe.x -= gameSpeed;

  // Item movement
  for (const item of items) item.x -= gameSpeed;

  // Recycle pipes
  if (pipes.length && pipes[0].x < -54) {
    pipes.shift(); // remove first
    addPipe(pipes[pipes.length-1].x + 200 + randInt(-20,40));
  }

  // Recycle items
  if (items.length && items[0].x < -32) items.shift();

  // Collision: Ground/Ceiling
  if (player.y < 0 || player.y + player.h > gameH) endGame();

  // Collision: Pipes
  for (const pipe of pipes) {
    // Top
    if (collideBox(player, {x: pipe.x, y:0, w:pipe.w, h:pipe.top})) endGame();
    // Bottom
    if (collideBox(player, {x: pipe.x, y:pipe.top+pipe.gap, w:pipe.w, h:gameH - (pipe.top+pipe.gap)})) endGame();
    // Scoring
    if (!pipe.scored && pipe.x + pipe.w < player.x) {
      pipe.scored = true;
      score += 1;
      scoreDiv.textContent = "Score: " + score;
      if (score % 12 === 0) { // Increase difficulty every 12 points
        gameSpeed += 0.4;
        gravity += 0.015;
      }
    }
  }

  // Collision: Items
  for (const item of items) {
    if (!item.collected && collideBox(player, {x:item.x, y:item.y, w:32, h:32})) {
      item.collected = true;
      score += 2;
      scoreDiv.textContent = "Score: " + score;
    }
  }
}

function gameLoop() {
  update();
  draw();
  if (state === "playing") requestAnimationFrame(gameLoop);
}

function flap() {
  if (state === "over") return;
  player.velocity = -6.5;
}

function endGame() {
  state = "over";
  restartBtn.style.display='inline';
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "#e53935";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", gameW/2, gameH/2-24);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Final Score: " + score, gameW/2, gameH/2+10);
  audio.pause();
}

function restartGame() {
  resetGameVars();
  restartBtn.style.display='none';
  audio.currentTime = 0;
  audio.play();
  scoreDiv.textContent = "Score: " + score;
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', e=>{
  if (e.code==='Space') {
    if (state==='over') restartGame();
    else flap();
    e.preventDefault();
  }
});
canvas.addEventListener('mousedown', () => flap());
canvas.addEventListener('touchstart', () => flap());
restartBtn.addEventListener('click', restartGame);

window.onload = function() {
  resetGameVars();
  audio.volume = 0.45;
  // audio.play() only if user interacted
  document.body.addEventListener('click', () => { if (!audioPlayed) { audio.play(); audioPlayed=true; } });
  draw();
  requestAnimationFrame(gameLoop);
};