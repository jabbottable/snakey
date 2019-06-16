const UP_KEY = 38;
const DOWN_KEY = 40;
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const SPACE_KEY = 32;

class Game {
    constructor(boardSize, canvas, snakeBodySize) {
        this.canvas = canvas;
        this.highScore = 0;
        this.boardSize = boardSize;
        this.snakeBodySize = snakeBodySize;
        this.resetGame();
    }
    resetGame() {
        this.snake = [];
        this.snakePositions = this.makeBoard(this.boardSize);
        var middlePoint = this.boardSize / 2;
        for (let snakePosition = 3; snakePosition >= 0; snakePosition--) {
            var snakeBody = new Pixel(this.canvas, middlePoint - snakePosition, middlePoint, this.snakeBodySize);
            this.snakePositions[middlePoint - snakePosition][middlePoint] = 1;
            this.snake.push(snakeBody);
        }
        this.getNewRandomFoodPosition(this.snakePositions);
        this.isGameOver = false;
        this.frameTime = 150;
        this.score = 0;
        this.currentKey = RIGHT_KEY;
        this.lastKeyDrawn = this.currentKey;
    }
    getNewRandomFoodPosition() {
        var size = this.snakePositions.length;
        var newFoodPosition = [];
        do {
            newFoodPosition[0] = Math.floor(Math.random() * Math.floor(size));
            newFoodPosition[1] = Math.floor(Math.random() * Math.floor(size));
        } while (this.snakePositions[newFoodPosition[0]][newFoodPosition[1]] == 1);
        this.foodPosition = newFoodPosition;
    }
    snakeHead() {
        return this.snake[this.snake.length - 1];
    }
    getNextPositions() {
        var nextXPos = this.snakeHead().posX;
        var nextYPos = this.snakeHead().posY;
        switch (this.currentKey) {
            case UP_KEY:
                nextYPos--;
                break;
            case DOWN_KEY:
                nextYPos++;
                break;
            case LEFT_KEY:
                nextXPos--;
                break;
            case RIGHT_KEY:
                nextXPos++;
                break;
        }
        return {
            nextXPos,
            nextYPos
        };
    }
    willSnakeEatSelf(nextXPos, nextYPos) {
        return this.snakePositions[nextXPos][nextYPos] == 1;
    }

    makeBoard(boardSize) {
        return Array.from({
                length: this.boardSize
            }, () =>
            Array.from({
                length: this.boardSize
            }, () => 0)
        );
    }
}

class Pixel {
    constructor(canvas, posX, posY, snakeBodySize) {
        this.posX = posX;
        this.posY = posY;
        this.context = canvas.getContext("2d");
        this.snakeBodySize = snakeBodySize;
        this.radius = snakeBodySize / 2;
    }
    draw(colour) {
        // this.context.beginPath();
        this.context.beginPath();
        this.context.arc((this.posX * this.snakeBodySize) + this.radius, (this.posY * this.snakeBodySize) + this.radius, this.radius - 1, 0, 2 * Math.PI);
        this.context.strokeStyle = colour;
        this.context.stroke();
        // this.context.fillRect(this.posX * this.snakeBodySize, this.posY * this.snakeBodySize, this.snakeBodySize - 1, this.snakeBodySize - 1);
        this.context.fillStyle = colour;
        this.context.fill();
    }
}

const snakeBodySize = 20;
const boardSize = 20;

var canvas = document.getElementById("myCanvas");

canvas.height = boardSize * snakeBodySize;
canvas.width = boardSize * snakeBodySize;

var currentFrameTime = 0;

var game = new Game(boardSize, canvas, snakeBodySize);

game.isGameOver = true;
drawText("Welcome to Snakey!\n\nPress space to\nbegin the adventure");

function update(progress) {
    if (game.isGameOver) {
        return;
    }
    currentFrameTime += progress;

    if (currentFrameTime > game.frameTime) {
        if (game.foodPosition[0] == game.snakeHead().posX && game.foodPosition[1] == game.snakeHead().posY) {
            game.getNewRandomFoodPosition(game.snakePositions);
            game.frameTime -= 1;
            game.score++;
            updateScore(game.score);
        } else {
            var snakeEnd = game.snake.shift();
            game.snakePositions[snakeEnd.posX][snakeEnd.posY] = 0;
        }

        var {
            nextXPos,
            nextYPos
        } = game.getNextPositions();
        game.lastKeyDrawn = game.currentKey;

        if (isSnakeOfScreen(nextXPos, nextYPos) || game.willSnakeEatSelf(nextXPos, nextYPos)) {
            if (game.score > game.highScore) {
                game.highScore = game.score;
                updateHighScore(game.highScore)
            }
            game.isGameOver = true;
            drawText("Game Over!\nPress space");
        } else {
            game.snake.push(new Pixel(canvas, nextXPos, nextYPos, snakeBodySize))
            game.snakePositions[nextXPos][nextYPos] = 1;
            currentFrameTime = 0;
        }
    }
}

function isSnakeOfScreen(nextXPos, nextYPos) {
    return nextXPos < 0 || nextXPos == boardSize || nextYPos < 0 || nextYPos == boardSize;
}

function draw() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    game.snake.forEach(function(snakeBody, index) {
        snakeBody.draw(index % 2 ? "darkgreen" : "green");
    });

    var food = new Pixel(canvas, game.foodPosition[0], game.foodPosition[1], snakeBodySize);
    food.draw("brown");
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
    const VALID_MOVE_KEYS = [UP_KEY, DOWN_KEY, LEFT_KEY, RIGHT_KEY];

    var requestedKey = e.keyCode;

    if (VALID_MOVE_KEYS.includes(requestedKey)) {
        if ((game.lastKeyDrawn == UP_KEY && requestedKey != DOWN_KEY) ||
            (game.lastKeyDrawn == DOWN_KEY && requestedKey != UP_KEY) ||
            (game.lastKeyDrawn == LEFT_KEY && requestedKey != RIGHT_KEY) ||
            (game.lastKeyDrawn == RIGHT_KEY && requestedKey != LEFT_KEY)) {
            game.currentKey = requestedKey;
            return;
        }
    }

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

function updateScore(score) {
    var scoreElement = document.getElementById("score");
    scoreElement.innerHTML = "Score = " + score;
}

function updateHighScore(score) {
    var scoreElement = document.getElementById("highScore");
    scoreElement.innerHTML = "High score = " + score;
}