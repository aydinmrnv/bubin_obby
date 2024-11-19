const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const startSound = document.getElementById("startSound");
const deathSound = document.getElementById("deathSound");

let gameRunning = false;
const smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
const carrots = [];
const poops = [];
const initialCarrotCount = 10;
let poopTimer = 0;
let score = 0;
let enemies = []; // Array to store enemies

// Function to get random color for enemies
function getRandomColor() {
  const colors = ["red", "blue", "yellow", "purple", "orange", "pink", "green"];
  return colors[Math.floor(Math.random() * colors.length)];
}

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

function drawEnemy(x, y, radius, color) {
  drawCircle(x, y, radius, color);

  // Teeth
  const toothSize = radius / 5;
  const teethCount = 6;
  const angleStep = (Math.PI * 2) / teethCount;

  for (let i = 0; i < teethCount; i++) {
    const angle = i * angleStep;
    const toothX = x + Math.cos(angle) * radius * 0.9;
    const toothY = y + Math.sin(angle) * radius * 0.9;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(toothX, toothY);
    ctx.lineTo(
      x + Math.cos(angle + angleStep / 2) * radius * 0.8,
      y + Math.sin(angle + angleStep / 2) * radius * 0.8
    );
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
  }
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

function moveEnemy(enemy) {
  const angle = Math.atan2(smiley.y - enemy.y, smiley.x - enemy.x);
  enemy.x += enemy.speed * Math.cos(angle);
  enemy.y += enemy.speed * Math.sin(angle);
}

function dropPoop() {
  poopTimer++;
  if (poopTimer >= 100) {
    poops.push({ x: enemy.x, y: enemy.y, radius: 10 });
    poopTimer = 0;
  }
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw smiley
  drawCircle(smiley.x, smiley.y, smiley.radius, "green");

  // Draw all enemies
  enemies.forEach(enemy => {
    drawEnemy(enemy.x, enemy.y, enemy.radius, enemy.color);
    moveEnemy(enemy);
  });

  // Draw carrots
  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
    }
  });

  // Check if all carrots are collected
  if (carrots.length === 0) {
    generateCarrots(initialCarrotCount);
  }

  // Draw poops
  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score--;
    }
  });

  // Display score
  displayScore();

  // Drop poop
  dropPoop();

  // Check collision with enemies
  enemies.forEach((enemy) => {
    if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
      deathSound.play();
      gameRunning = false;
      alert("Game Over! Your score: " + score);
      location.reload();
    }
  });

  // Add new enemy after every 20 points
  if (score > 0 && score % 20 === 0 && enemies.length === score / 20) {
    enemies.push({
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 25,
      speed: 2,
      color: getRandomColor()
    });
  }

  requestAnimationFrame(updateGame);
}

// Track mouse movement
canvas.addEventListener("mousemove", (event) => {
  // Update smiley position based on mouse coordinates
  smiley.x = event.clientX;
  smiley.y = event.clientY;
});

// Start game
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  startSound.play();
  gameRunning = true;
  generateCarrots(initialCarrotCount);
  updateGame();
});

