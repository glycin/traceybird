//import { submitDeath, submitError, submitScore, submitTap, getSession } from './api.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");
const playerNameInput = document.getElementById("playerName");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let playerName = "";

let birdX, birdY;
let birdVelocity = 0.0;
const gravity = 1000;
const jumpStrength = -500;

const obstacleWidth = 50;
const obstacleGap = 200;
const baseObstacleSpeed = 2;
const speedMultiplier = window.innerWidth < 600 ? 0.8 : 1;

const obstacleSpeed = baseObstacleSpeed * speedMultiplier;
let obstacles = [];

let score = 0;

const birdNormalImage = new Image();
birdNormalImage.src = "art/bird.png";

const birdFlapImage = new Image();
birdFlapImage.src = "art/bird-flap.png";

const serverRackImage = new Image();
serverRackImage.src = "art/server_rack.jpg";

const fireFrames = [];
const numberOfFrames = 12;
for (let i = 0; i < numberOfFrames; i++) {
    const frame = new Image();
    frame.src = `art/fire/frame_${i}.png`;
    fireFrames.push(frame);
}

const cloudImage = new Image();
cloudImage.src = "art/cloud.png";

const cloudSpeed = 1;
let clouds = [];
const cloudHeight = 272 / 2;
const cloudWidth = 368 / 2;

let currentBirdImage = birdNormalImage;

startButton.addEventListener("click", () => {
    playerName = playerNameInput.value || "Player"; // Default to "Player" if no name is entered
    startGame();
});

function initClouds() {
    for (let i = 0; i < 4; i++) {
        clouds.push({
            x: i * (canvas.width / 3),
            y: Math.random() * (canvas.height)
        });
    }
}

initClouds()

function startGame() {
    menu.style.display = "none";
    canvas.style.display = "block";

    birdX = canvas.width / 2;
    birdY = canvas.height / 2;
    birdVelocity = 0.0;
    score = 0;
    obstacles = [];
    spawnObstacle();
    gameLoop();
}

let lastTime = 0;
const timeStep = 1000 / 60;

function gameLoop(currentTime) {
    var deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    if(isNaN(deltaTime)) {
        deltaTime = 16
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateClouds();
    drawClouds();

    birdVelocity += gravity * (deltaTime / 1000);
    birdY += birdVelocity * (deltaTime / 1000);
    
    if (birdVelocity < 0) {
        currentBirdImage = birdFlapImage;
    } else {
        currentBirdImage = birdNormalImage;
    }

    const birdWidth = 100;
    const birdHeight = 100;
    ctx.drawImage(currentBirdImage, birdX - birdWidth / 2, birdY - birdHeight / 2, birdWidth, birdHeight);

    updateObstacles();

    if (checkCollision()) {
        resetGame();
        return;
    }

    ctx.fillStyle = "#3fff26";
    ctx.font = "36px dogicabold";
    ctx.textAlign = "center";
    ctx.fillText(`${score}`, canvas.width / 2, 50);

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", () => {
    birdVelocity = jumpStrength;
});

canvas.addEventListener("touchstart", () => {
    birdVelocity = jumpStrength;
});

function spawnObstacle() {
    const minGapY = 50;
    const maxGapY = canvas.height - obstacleGap - minGapY;
    const gapY = Math.random() * maxGapY + minGapY;
    const fireCount = Math.floor(Math.random() * 15) + 1;
    const fireArray = [];

    for (let i = 0; i < fireCount; i++) {
        const fireX = canvas.width + Math.random() * 50 - 5
        const fireYTop = Math.random() * (gapY - 20);
        fireArray.push(new Fire(fireX, fireYTop, fireFrames)); 

        const fireYBottom = gapY + obstacleGap + Math.random() * (canvas.height - gapY - obstacleGap - 20); 
        fireArray.push(new Fire(fireX, fireYBottom, fireFrames)); 
    }

    obstacles.push({
        x: canvas.width, 
        y: gapY,
        passed: false, 
        flames: fireArray
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= obstacleSpeed;

        const imageWidth = obstacleWidth;
        const topObstacleHeight = obstacle.y;
        const bottomObstacleHeight = canvas.height - obstacle.y - obstacleGap;

        drawRepeatingImage(ctx, serverRackImage, obstacle.x, 0, imageWidth, topObstacleHeight);
        drawRepeatingImage(ctx, serverRackImage, obstacle.x, obstacle.y + obstacleGap, imageWidth, bottomObstacleHeight);
        obstacle.flames.forEach((fire) => {
            fire.update();
            fire.x -= obstacleSpeed;
            fire.draw(ctx);
        });

        if (!obstacle.passed && obstacle.x + obstacleWidth < birdX) {
            score++;
            obstacle.passed = true;
        }

        if (obstacle.x + obstacleWidth < 0) {
            obstacles.splice(index, 1);
        }
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        spawnObstacle();
    }
}

function checkCollision() {
    if (birdY < 0 || birdY > canvas.height) {
        return true;
    }

    for (const obstacle of obstacles) {
        const withinX = birdX + 10 > obstacle.x && birdX - 10 < obstacle.x + obstacleWidth;
        const hitTop = birdY - 10 < obstacle.y;
        const hitBottom = birdY + 10 > obstacle.y + obstacleGap;

        if (withinX && (hitTop || hitBottom)) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0.0;
    obstacles = [];
    score = 0;

    canvas.style.display = "none";
    menu.style.display = "block";
}

function drawRepeatingImage(ctx, img, x, y, width, height) {
    const patternHeight = img.height / 2;
    let currentY = y;

    while (currentY < y + height) {
        const drawHeight = Math.min(patternHeight, height - (currentY - y));
        ctx.drawImage(img, x, currentY, width, drawHeight);
        currentY += drawHeight;
    }
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloudWidth, cloudHeight);
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloudSpeed;

        if (cloud.x + cloudWidth < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * (canvas.height / 4);
        }
    });
}

class Fire {
    constructor(x, y, frames) {
        this.x = x;
        this.y = y;
        this.frames = frames;
        this.currentFrameIndex = 0;
        this.frameTime = 0; 
    }

    update() {
        this.frameTime += 1;
        if (this.frameTime >= 5) {
            this.frameTime = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.frames[this.currentFrameIndex], this.x, this.y, 15, 50);
    }
}