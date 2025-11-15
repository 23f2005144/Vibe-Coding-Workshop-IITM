const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const pipeWidth = 52;
const pipeGap = 150;
const pipeInterval = 120;

// Game state variables
let pipes = [];
let frameCount = 0;
let score = 0;
let gameActive = true;

// Game variables
let bird = {
    x: 50,
    y: 150,
    width: 40,
    height: 30,
    gravity: 0.4,
    lift: -10,
    velocity: 0
};
const birdSprite = new Image();
birdSprite.src = 'assets/images/pikachu.png';

// Pipe variables
const pipeSprite = new Image();
pipeSprite.src = 'assets/images/pipe.png';

// Control the bird
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        bird.velocity += bird.lift;
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.drawImage(birdSprite, bird.x, bird.y, bird.width, bird.height);

    // Pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }

        // Collision detection
        if (
            bird.x < pipes[i].x + pipes[i].width &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].top || bird.y + bird.height > canvas.height - pipes[i].bottom)
        ) {
            gameOver();
        }

        // Increase score
        if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].passed) {
            score++;
            pipes[i].passed = true;
        }

        ctx.drawImage(pipeSprite, pipes[i].x, 0, pipes[i].width, pipes[i].top);
        ctx.drawImage(pipeSprite, pipes[i].x, canvas.height - pipes[i].bottom, pipes[i].width, pipes[i].bottom);
    }

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '30px Verdana';
    ctx.fillText('Score: ' + score, 10, canvas.height - 30);

    // Ground collision
    if (bird.y + bird.height > canvas.height) {
        gameOver();
    }
}

function gameOver() {
    // Show the game over screen
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').innerText = score;
    gameActive = false;
}

// Restart the game
document.getElementById('restartButton').addEventListener('click', function() {
    resetGame();
});

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameActive = true;
    document.getElementById('gameOverScreen').style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    frameCount++;

    if (frameCount % pipeInterval === 0) {
        let top = Math.random() * (canvas.height - pipeGap);
        let bottom = canvas.height - top - pipeGap;
        pipes.push({
            x: canvas.width,
            top: top,
            bottom: bottom,
            width: pipeWidth,
            passed: false
        });
    }

    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
