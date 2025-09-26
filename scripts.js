// ========== CONSTANTES ==========
const canvasWidth = 400;
const canvasHeight = 600;

const canvas = document.getElementById("pong");
const btnStart = document.getElementById("btnStart");
const leftBtn = document.getElementById("gauche");
const rightBtn = document.getElementById("droite");
const scoreDisplay = document.getElementById("score");

const dpr = window.devicePixelRatio || 1;
const ctx = canvas.getContext("2d");

// ball / paddle settings
const initialBallSpeed = 220; // px/s
const ballRadius = 8;

const paddleWidth = 100;
const paddleHeight = 12;
const paddleSpeed = 400; // px/s
const maxBounceAngleDeg = 60; // degrees

// ========== ETAT GLOBAL ==========
let gameState = "ready"; // ready | running | gameover
let startTime = null;
let lastFrameTime = null;
let elapsedTime = 0;

const ball = {
  x: canvasWidth / 2,
  y: canvasHeight / 2,
  radius: ballRadius,
  speed: initialBallSpeed,
  vx: 0,
  vy: 0
};

const paddle = {
  x: (canvasWidth - paddleWidth) / 2,
  y: canvasHeight - 40,
  width: paddleWidth,
  height: paddleHeight,
  speed: paddleSpeed
};

const input = {
  leftPressed: false,
  rightPressed: false,
  touchLeft: false,
  touchRight: false
};

// ========== UTILITAIRES ==========
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function setBallAtCenter() {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  // reset velocity
  ball.vx = 0;
  ball.vy = 0;
  ball.speed = initialBallSpeed;
}

function setBallRandomDirection() {
  // angle between -maxBounceAngleDeg and +maxBounceAngleDeg (degrees), convert to radians
  const angDeg = (Math.random() * 2 * maxBounceAngleDeg) - maxBounceAngleDeg;
  const ang = angDeg * Math.PI / 180;
  ball.vx = ball.speed * Math.sin(ang);
  ball.vy = -ball.speed * Math.cos(ang); // going up
}

// ========== CANVAS INITIALISATION ==========
function initCanvas() {
  // make canvas sharp on high-DPI screens
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  canvas.width = Math.round(canvasWidth * dpr);
  canvas.height = Math.round(canvasHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale so drawing uses logical px coordinates
  ctx.textBaseline = "top";
}

// ========== RENDER ==========
function render() {
  // clear
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // background
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // paddle
  ctx.fillStyle = "#f1c40f";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // ball
  ctx.beginPath();
  ctx.fillStyle = "#ffffff";
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // optional: draw border
  ctx.strokeStyle = "#ffffff22";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

// ========== PHYSIQUE ==========
function updatePhysics(dt) {
  // paddle movement
  if (input.leftPressed || input.touchLeft) {
    paddle.x -= paddle.speed * dt;
  }
  if (input.rightPressed || input.touchRight) {
    paddle.x += paddle.speed * dt;
  }
  paddle.x = clamp(paddle.x, 0, canvasWidth - paddle.width);

  // ball movement
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // collisions murs left/right
  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + ball.radius >= canvasWidth) {
    ball.x = canvasWidth - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }
  // collision haut
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  // collision raquette
  if (ball.y + ball.radius >= paddle.y) {
    if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
      // compute relative impact [-1, 1]
      const relative = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const maxAngleRad = maxBounceAngleDeg * Math.PI / 180;
      const bounceAngle = relative * maxAngleRad;
      // new velocity direction
      ball.vx = ball.speed * Math.sin(bounceAngle);
      ball.vy = -ball.speed * Math.cos(bounceAngle);
      // normalize magnitude then set to ball.speed (to avoid drift)
      const mag = Math.hypot(ball.vx, ball.vy);
      if (mag !== 0) {
        ball.vx = (ball.vx / mag) * ball.speed;
        ball.vy = (ball.vy / mag) * ball.speed;
      }
      // move ball just above paddle to prevent sticking
      ball.y = paddle.y - ball.radius - 0.1;

      // optional: increase speed a little
      // ball.speed *= 1.01;
    }
  }

  // game over (ball below bottom)
  if (ball.y - ball.radius > canvasHeight) {
    gameState = "gameover";
    showGameOver();
  }
}

// ========== UI / SCORE ==========
function updateUI() {
  scoreDisplay.textContent = "Score : " + Math.floor(elapsedTime);
}

function showGameOver() {
  // simple alert or update DOM; here we update score text
  scoreDisplay.textContent = "Partie terminée — Score : " + Math.floor(elapsedTime) + " s";
}

// ========== BOUCLE PRINCIPALE ==========
function gameLoop(nowTimestamp) {
  if (lastFrameTime === null) lastFrameTime = nowTimestamp;
  const deltaTime = (nowTimestamp - lastFrameTime) / 1000;
  lastFrameTime = nowTimestamp;

  if (gameState === "running") {
    updatePhysics(deltaTime);
    elapsedTime = (nowTimestamp - startTime) / 1000;
    updateUI();
  }

  render();
  requestAnimationFrame(gameLoop);
}

// ========== CONTROLES & ÉVÉNEMENTS ==========
function setupEventListeners() {
  // bouton nouvelle partie
  btnStart.addEventListener("click", () => {
    resetGame();
    startGame();
  });

  // clavier
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") input.leftPressed = true;
    if (e.key === "ArrowRight") input.rightPressed = true;
    if ((e.key === " " || e.key === "Enter") && gameState !== "running") {
      resetGame();
      startGame();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") input.leftPressed = false;
    if (e.key === "ArrowRight") input.rightPressed = false;
  });

  // pointer (souris + tactile) pour les boutons
  leftBtn.addEventListener("pointerdown", () => (input.touchLeft = true));
  leftBtn.addEventListener("pointerup", () => (input.touchLeft = false));
  leftBtn.addEventListener("pointerleave", () => (input.touchLeft = false));

  rightBtn.addEventListener("pointerdown", () => (input.touchRight = true));
  rightBtn.addEventListener("pointerup", () => (input.touchRight = false));
  rightBtn.addEventListener("pointerleave", () => (input.touchRight = false));
}

// ========== COMMANDE START / RESET ==========
function resetGame() {
  gameState = "ready";
  elapsedTime = 0;
  setBallAtCenter();
  setBallRandomDirection();
  paddle.x = (canvasWidth - paddle.width) / 2;
  updateUI();
}

function startGame() {
  gameState = "running";
  startTime = performance.now();
  lastFrameTime = startTime;
}

// ========== INITIALISATION ==========
function setBallAtCenter() {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
}

function main() {
  initCanvas();
  setupEventListeners();
  resetGame();
  requestAnimationFrame(gameLoop);
}

main();
