const UP_KEY = 38;
const DOWN_KEY = 40;
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const SPACE_KEY = 32;
const GRAVITY = 9.81;


class Player {
    constructor(canvas, posX, leftKey, rightKey) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.posX = posX;
        this.posY = this.canvas.height * 0.9;
        this.height = 50;
        this.width = 20;
        this.leftKey = leftKey;
        this.rightKey = rightKey;
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = "blue";
        this.context.fillRect(
            this.posX,
            (this.canvas.height * 0.9) - this.height,
            this.width,
            this.height);
    }

    checkKey(requestedKey) {
        if (requestedKey == this.leftKey) {
            this.posX -= 10;
        } else if (requestedKey == this.rightKey) {
            this.posX += 10;
        }
    }
}

class Ball {
    constructor(canvas, posX, posY, radius){
        this.context = canvas.getContext("2d");
        this.posX = posX;
        this.posY = posY;
        this.radius = radius;
        this.colour = "black";
    }
    
    draw (){
        this.context.beginPath();
        this.context.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        this.context.strokeStyle = this.colour;
        this.context.stroke();
    }
}

class Game {
    constructor(canvas) {
        this.currentKey = 1;
        this.lastKeyDrawn = this.currentKey;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.highScore = 0;
        this.resetGame();
        this.drawFloor();
    }
    resetGame() {
        this.players = [];

        var player = new Player(this.canvas, this.canvas.width * 0.66, LEFT_KEY, RIGHT_KEY);
        this.players.push(player);

        this.balls = [];

        var ball = new Ball(this.canvas, this.canvas.width * 0.5, this.canvas.height * 0.25, 30);
        this.balls.push(ball);

        this.isGameOver = false;
        this.frameTime = 1;
        this.score = 0;
    }

    drawFloor() {
        this.context.beginPath();
        this.context.fillStyle = "brown";
        this.context.fillRect(
            0,
            this.canvas.height * 0.9,
            this.canvas.width,
            this.canvas.height);
    }
}

const snakeBodySize = 20;
const boardSize = 50;

var canvas = document.getElementById("myCanvas");

canvas.height = 450;
canvas.width = 800;

var currentFrameTime = 0;

var game = new Game(canvas);

game.isGameOver = true;
drawText("Welcome to Bouncey!\n\nPress space to\nbegin the adventure");

function update(progress) {
    if (game.isGameOver) {
        return;
    }
    currentFrameTime += progress;

    if (currentFrameTime > game.frameTime) {}
}


function draw() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height * 0.9);
    game.players.forEach(player => {
        player.draw();
    });
    game.balls.forEach(ball => {
        ball.draw();
    });
}

function loop(timestamp) {
    var progress = timestamp - lastRender

    update(progress)
    if (!game.isGameOver) {
        draw()
    }

    lastRender = timestamp
    window.requestAnimationFrame(loop)
}
var lastRender = 0
window.requestAnimationFrame(loop)


document.addEventListener("keydown", logKey);

function logKey(e) {
    var requestedKey = e.keyCode;

    game.players.forEach(player => {
        player.checkKey(requestedKey);
    });
    
    if (game.isGameOver && requestedKey == SPACE_KEY) {
        game.resetGame();
    }
}

function drawText(text) {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";

    const lineHeight = canvas.height / 15;
    const fontHeight = Math.floor(lineHeight * 0.9);
    ctx.font = fontHeight + "px Arial";
    ctx.textAlign = "center";

    const texts = text.split("\n");
    const numberOfLines = texts.length;

    for (let line = 0; line < numberOfLines; line++) {
        const lineText = texts[line];
        const evenOffset = numberOfLines % 2 == 0 ? 0.5 : 0;
        const offset = (line - Math.floor(numberOfLines / 2) + evenOffset) * lineHeight;
        ctx.fillText(lineText, canvas.width / 2, (canvas.height / 2) + offset + lineHeight / 2);
    }
}