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
const powerUpSound = document.getElementById("powerUpSound");
const bgMusic = document.getElementById("bgMusic");

let gameRunning = false;
let smiley = { x: canvas.width / 2, y: canvas.height / 2, radius: 20, speed: 5 };
let enemy = { x: 100, y: 100, radius: 25, speed: 2, poopInterval: 100 };
const carrots = [];
const poops = [];
const powerUps = [];
const initialCarrotCount = 10;
let poopTimer = 0;
let score = 0;
let enemySlowed = false; // Power-up status
let level = 1;

// Functions for generating positions and drawing elements
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

function drawPowerUp(x, y, radius) {
  drawCircle(x, y, radius, "blue");
}

function isCollision(x1, y1, r1, x2, y2, r2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return dist < r1 + r2;
}

function displayScore() {
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Level: ${level}`, canvas.width - 100, 40);
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

function generatePowerUps(count) {
  for (let i = 0; i < count; i++) {
    powerUps.push({
      x: randomPosition(canvas.width),
      y: randomPosition(canvas.height),
      radius: 15,
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

// Function to increase difficulty by adding new enemies or hazards
function increaseDifficulty() {
  if (score % 10 === 0 && score > 0) {
    level++;
    enemy.speed += 0.5; // Increase enemy speed as the level increases
    generateCarrots(5); // Add more carrots
    generatePowerUps(2); // Add more power-ups
  }
}

// Main game loop
function updateGame(event) {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Smiley follows mouse
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  smiley.x = mouseX;
  smiley.y = mouseY;

  // Draw smiley
  drawCircle(smiley.x, smiley.y, smiley.radius, "green");

  // Draw enemy
  drawEnemy(enemy.x, enemy.y, enemy.radius);

  // Draw carrots
  carrots.forEach((carrot, index) => {
    drawCircle(carrot.x, carrot.y, carrot.radius, "orange");

    if (isCollision(smiley.x, smiley.y, smiley.radius, carrot.x, carrot.y, carrot.radius)) {
      carrots.splice(index, 1);
      score++;
    }
  });

  // Draw power-ups
  powerUps.forEach((powerUp, index) => {
    drawPowerUp(powerUp.x, powerUp.y, powerUp.radius);

    if (isCollision(smiley.x, smiley.y, smiley.radius, powerUp.x, powerUp.y, powerUp.radius)) {
      powerUps.splice(index, 1);
      enemySlowed = true;
      enemy.speed *= 0.5; // Slow down enemy
      powerUpSound.play();
      setTimeout(() => {
        enemySlowed = false;
        enemy.speed *= 2; // Reset enemy speed after power-up ends
      }, 5000); // Power-up lasts for 5 seconds
    }
  });

  // Draw poops
  poops.forEach((poop, index) => {
    drawCircle(poop.x, poop.y, poop.radius, "brown");

    if (isCollision(smiley.x, smiley.y, smiley.radius, poop.x, poop.y, poop.radius)) {
      poops.splice(index, 1);
      score -= 5;
    }
  });

  // Check for collisions with enemy
  if (isCollision(smiley.x, smiley.y, smiley.radius, enemy.x, enemy.y, enemy.radius)) {
    deathSound.play();
    gameRunning = false;
    alert("Game Over! Your score: " + score);
    location.reload();
  }

  // Increase difficulty based on score
  increaseDifficulty();

  // Display score and level
  displayScore();

  // Move enemy
  moveEnemy();

  // Drop poops from enemy
  dropPoop();

  // Keep the game running with animation
  requestAnimationFrame((e) => updateGame(e));
}

// Start button listener to start the game
startButton.addEventListener("click", () => {
  startScreen.style.display = "none"; // Hide start screen
  startSound.play(); // Play start sound
  bgMusic.loop = true; // Loop background music
  bgMusic.play(); // Play background music
  gameRunning = true; // Start the game
  generateCarrots(initialCarrotCount); // Generate initial carrots
  generatePowerUps(3); // Generate initial power-ups
  updateGame(); // Begin game loop
});

// Event listener for mouse movement
canvas.addEventListener('mousemove', (event) => {
  if (gameRunning) {
    updateGame(event);
  }
});
