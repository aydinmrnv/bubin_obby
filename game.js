// Canvas and Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game Elements
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const startSound = document.getElementById("startSound");
const deathSound = document.getElementById("deathSound");
const backgroundMusic = document.getElementById("backgroundMusic");

let gameRunning = false;
const smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
const enemy = { x: 100, y: 100, radius: 25, speed: 2, poopInterval: 100 };
const carrots = [];
const poops = [];
const initialCarrotCount = 10;
let poopTimer = 0;
let score = 0;

// Mouse Movement Listener
canvas.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Update the smiley position to follow the mouse
  smiley.x = mouseX;
  smiley.y = mouseY;
});

function randomPosition(max) {
  return Math.random() * (max - 50) + 25;
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawEnemy(x, y, radius) {
  drawCircle(x, y, radius, "red");
}

function isCollision(x1, y1, r1, x2, y2, r2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return dist < r1 + r2;
}

function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
}

function generateCarrots(count) {
  for (let i = 0; i < count; i++) {
    carrots.push({
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 10,
    });
  }
}

function moveEnemy() {
  const angle = Math.atan2(smiley.y - enemy.y, smiley.x - enemy.x);
  enemy.x += enemy.speed * Math.cos(angle);
  enemy.y += enemy.speed * Math.sin(angle);
}

function dropPoop() {
  poopTimer++;
  if (poopTimer >= enemy.poopInterval) {
    poops.push({ x: enemy.x, y: enemy.y, radius: 10 });
    poopTimer = 0;
  }
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCircle(smiley.x, smiley.y, smiley.radius, "green");

  drawEnemy(enemy.x, enemy.y, enemy.radius);

  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
    }
  });

  if (carrots.length === 0) {
    generateCarrots(initialCarrotCount);
  }

  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5;
    }
  });

  if (score % 5 === 0 && score > 0) {
    enemy.speed += 0.1;
  }

  displayScore();
  moveEnemy();
  dropPoop();

  if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
    deathSound.play();
    gameRunning = false;
    alert("Game Over! Your score: " + score);
    location.reload();
  }

  if (score < -1) {
    deathSound.play();
    gameRunning = false;
    alert("Game Over! Your score: " + score);
    location.reload();
  }

  requestAnimationFrame(updateGame);
}

// Start Button Listener
startButton.addEventListener("click", () => {
  startScreen.style.display = "none"; // Hide start screen
  startSound.play(); // Play start sound
  backgroundMusic.play(); // Play background music on loop
  gameRunning = true; // Start the game
  generateCarrots(initialCarrotCount); // Generate initial carrots
  updateGame(); // Begin game loop
});
