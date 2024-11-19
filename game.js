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
const carrots = [];
const powerUps = [];
const initialCarrotCount = 10;
let score = 0;
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

// Increase difficulty by adding more carrots and power-ups
function increaseDifficulty() {
  if (score % 10 === 0 && score > 0) {
    level++;
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
    drawCircle(powerUp.x, powerUp.y, powerUp.radius, "blue");

    if (isCollision(smiley.x, smiley.y, smiley.radius, powerUp.x, powerUp.y, powerUp.radius)) {
      powerUps.splice(index, 1);
      powerUpSound.play();
      score += 5; // Gain 5 points on power-up
    }
  });

  // Increase difficulty based on score
  increaseDifficulty();

  // Display score and level
  displayScore();

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
