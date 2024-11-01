//import { submitDeath, submitError, submitScore, submitTap, getSession } from './api.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");
const playerNameInput = document.getElementById("playerName");

// Set canvas size to match the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Placeholder for the player’s name
let playerName = "";

// Bird variables for position and movement
let birdX, birdY;
let birdVelocity = 0.0;
const gravity = 1000;
const jumpStrength = -500;

// Obstacle variables
const obstacleWidth = 50;
const obstacleGap = 200; // Adjusted for wider gap
const baseObstacleSpeed = 2; // Base speed
const speedMultiplier = window.innerWidth < 600 ? 0.8 : 1; // Adjust speed based on width

const obstacleSpeed = baseObstacleSpeed * speedMultiplier;
let obstacles = [];

// Score variable
let score = 0;

// Load the bird images
const birdNormalImage = new Image();
birdNormalImage.src = "art/bird.png"; // Normal bird image

const birdFlapImage = new Image();
birdFlapImage.src = "art/bird-flap.png"; // Flapping bird image

const serverRackImage = new Image();
serverRackImage.src = "art/server_rack.jpg";

const fireFrames = [];
const numberOfFrames = 12; // Adjust based on the number of frames you have
for (let i = 0; i < numberOfFrames; i++) {
    const frame = new Image();
    frame.src = `art/fire/frame_${i}.png`; // Ensure the path to your fire frames is correct
    fireFrames.push(frame);
}

const cloudImage = new Image();
cloudImage.src = "art/cloud.png";

const cloudSpeed = 1; // Speed of the cloud scroll
let clouds = []; // Array to hold cloud positions
const cloudHeight = 272 / 2; // Height of the cloud image
const cloudWidth = 368 / 2; // Height of the cloud image

// Current bird image (starts as normal)
let currentBirdImage = birdNormalImage;

// Event listener for the "Start Game" button
startButton.addEventListener("click", () => {
    playerName = playerNameInput.value || "Player"; // Default to "Player" if no name is entered
    startGame();
});

function initClouds() {
    // Populate clouds array with initial positions
    for (let i = 0; i < 4; i++) { // Create 3 clouds
        clouds.push({
            x: i * (canvas.width / 3), // Spread them out across the width
            y: Math.random() * (canvas.height) // Random Y position in the upper quarter of the screen
        });
    }
}

initClouds()

// Function to start the game
function startGame() {
    // Hide the menu and display the canvas
    menu.style.display = "none";
    canvas.style.display = "block";

    // Center the bird on the screen and reset score and obstacles
    birdX = canvas.width / 2;
    birdY = canvas.height / 2;
    birdVelocity = 0.0;
    score = 0;
    obstacles = [];
    spawnObstacle();
    // Start the game loop
    gameLoop();
}

let lastTime = 0; // Keep track of the last time update
const timeStep = 1000 / 60; // Target 60 FPS (16.67 ms per frame)

// Function to handle the game loop
function gameLoop(currentTime) {
    var deltaTime = currentTime - lastTime; // Calculate time since last frame
    lastTime = currentTime;
    if(isNaN(deltaTime)) {
        deltaTime = 16
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateClouds();
    drawClouds();

    birdVelocity += gravity * (deltaTime / 1000); // Adjust gravity based on time
    birdY += birdVelocity * (deltaTime / 1000); // Move bird based on time
    
    // Change to flapping image when bird jumps, back to normal on descent
    if (birdVelocity < 0) {
        currentBirdImage = birdFlapImage; // Use flapping image on ascent
    } else {
        currentBirdImage = birdNormalImage; // Use normal image on descent
    }

    // Draw the current bird image
    const birdWidth = 100; // Adjust width as needed
    const birdHeight = 100; // Adjust height as needed
    ctx.drawImage(currentBirdImage, birdX - birdWidth / 2, birdY - birdHeight / 2, birdWidth, birdHeight);

    // Update and draw obstacles
    updateObstacles();

    // Check for collisions with obstacles or out of bounds
    if (checkCollision()) {
        resetGame();
        return;
    }

    // Display the score
    ctx.fillStyle = "#3fff26";
    ctx.font = "36px dogicabold"; // Set the font size and custom font
    ctx.textAlign = "center"; // Center the text
    ctx.fillText(`${score}`, canvas.width / 2, 50); // Centered horizontally, near the top


    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Event listener for flapping
canvas.addEventListener("click", () => {
    birdVelocity = jumpStrength; // Make the bird "flap" (jump)
});

canvas.addEventListener("touchstart", () => {
    birdVelocity = jumpStrength; // Make the bird "flap" (jump)
});

// Function to spawn a new obstacle with a gap
function spawnObstacle() {
    const minGapY = 50; // Minimum Y position for the top obstacle
    const maxGapY = canvas.height - obstacleGap - minGapY;
    const gapY = Math.random() * maxGapY + minGapY;
    const fireCount = Math.floor(Math.random() * 15) + 1; // Random number of fire GIFs
    const fireArray = []; // Array to hold Fire objects

    // Generate random fire positions and create Fire objects
    for (let i = 0; i < fireCount; i++) {
        const fireX = canvas.width + Math.random() * 50 - 5
        const fireYTop = Math.random() * (gapY - 20); // Y position within the top obstacle height
        fireArray.push(new Fire(fireX, fireYTop, fireFrames)); // Create and add Fire object for top

        const fireYBottom = gapY + obstacleGap + Math.random() * (canvas.height - gapY - obstacleGap - 20); // Y position for the bottom obstacle
        fireArray.push(new Fire(fireX, fireYBottom, fireFrames)); // Create and add Fire object for bottom
    }

    obstacles.push({
        x: canvas.width, // Start at the right side of the screen
        y: gapY,
        passed: false, // Track if the obstacle has been passed by the bird
        flames: fireArray // Store flames associated with this obstacle
    });
}

// Function to update and draw obstacles
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        // Move obstacle to the left
        obstacle.x -= obstacleSpeed;

        const imageWidth = obstacleWidth;
        const topObstacleHeight = obstacle.y;
        const bottomObstacleHeight = canvas.height - obstacle.y - obstacleGap;

        // Draw the top obstacle with repeated images
        drawRepeatingImage(ctx, serverRackImage, obstacle.x, 0, imageWidth, topObstacleHeight);

        // Draw the bottom obstacle with repeated images
        drawRepeatingImage(ctx, serverRackImage, obstacle.x, obstacle.y + obstacleGap, imageWidth, bottomObstacleHeight);

        // Update and draw each fire associated with the obstacle
        obstacle.flames.forEach((fire) => {
            fire.update(); // Update the fire animation
            fire.x -= obstacleSpeed; // Move fire with the obstacle
            fire.draw(ctx); // Draw the current frame of the fire
        });

        // Check if the bird has passed this obstacle to increase score
        if (!obstacle.passed && obstacle.x + obstacleWidth < birdX) {
            score++;
            obstacle.passed = true;
        }

        // Remove obstacle if it's off the screen
        if (obstacle.x + obstacleWidth < 0) {
            obstacles.splice(index, 1);
        }
    });

    // Spawn a new obstacle periodically
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        spawnObstacle();
    }
}

// Function to check for collisions
function checkCollision() {
    // Check if bird is out of bounds
    if (birdY < 0 || birdY > canvas.height) {
        return true;
    }

    // Check collision with each obstacle
    for (const obstacle of obstacles) {
        const withinX = birdX + 10 > obstacle.x && birdX - 10 < obstacle.x + obstacleWidth;
        const hitTop = birdY - 10 < obstacle.y;
        const hitBottom = birdY + 10 > obstacle.y + obstacleGap;

        if (withinX && (hitTop || hitBottom)) {
            return true; // Collision detected
        }
    }
    return false;
}

// Function to reset the game to the initial state
function resetGame() {
    // Reset variables and return to menu
    birdY = canvas.height / 2;
    birdVelocity = 0.0;
    obstacles = [];
    score = 0;

    // Show the menu again
    canvas.style.display = "none";
    menu.style.display = "block";
}

function drawRepeatingImage(ctx, img, x, y, width, height) {
    const patternHeight = img.height / 2; // Height of the server rack image
    let currentY = y;

    // Draw the image repeatedly until the full height is covered
    while (currentY < y + height) {
        // Check if the next image would exceed the intended height
        const drawHeight = Math.min(patternHeight, height - (currentY - y));
        ctx.drawImage(img, x, currentY, width, drawHeight);
        currentY += drawHeight; // Move down to draw the next instance
    }
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloudWidth, cloudHeight); // Adjust width as necessary
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloudSpeed; // Move cloud left

        // Reset cloud position if it goes off-screen
        if (cloud.x + cloudWidth < 0) {
            cloud.x = canvas.width; // Move it back to the right side of the screen
            cloud.y = Math.random() * (canvas.height / 4); // Randomize the Y position again
        }
    });
}

class Fire {
    constructor(x, y, frames) {
        this.x = x; // X position of the fire
        this.y = y; // Y position of the fire
        this.frames = frames; // Array of frames for the fire animation
        this.currentFrameIndex = 0; // Current frame index for animation
        this.frameTime = 0; // Time accumulator for frame timing
    }

    update() {
        this.frameTime += 1; // Increment frame time
        if (this.frameTime >= 5) { // Change frame every 5 frames
            this.frameTime = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length; // Cycle through frames
        }
    }

    draw(ctx) {
        ctx.drawImage(this.frames[this.currentFrameIndex], this.x, this.y, 15, 50); // Adjust size as needed
    }
}