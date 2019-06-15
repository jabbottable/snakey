const snakeBodySize = 20;
const boardSize = 20;

class SnakeBody {
    constructor(canvas, posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.context = canvas.getContext("2d");
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = "red";

        this.context.fillRect(this.posX * snakeBodySize, this.posY * snakeBodySize, snakeBodySize - 1, snakeBodySize - 1);
        this.context.stroke();
    }
}

class Food {
    constructor(canvas, posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.context = canvas.getContext("2d");
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = "blue";

        this.context.fillRect(this.posX * snakeBodySize, this.posY * snakeBodySize, snakeBodySize - 1, snakeBodySize - 1);
        this.context.stroke();
    }
}

var canvas = document.getElementById("myCanvas");

canvas.height = boardSize * snakeBodySize;
canvas.width = boardSize * snakeBodySize;

var {
    snake,
    foodPosition,
    snakePositions,
    isGameOver
} = startGame();

isGameOver = true;
drawText("Welcome to Snakey!!\n\nPress space to\nbegin the adventure");

var frameTime = 200;
var currentFrameTime = 0;

const upKey = 38;
const downKey = 40;
const leftKey = 37;
const rightKey = 39;
const spaceKey = 32;



const validMoveKeys = [upKey, downKey, leftKey, rightKey];

var currentKey = rightKey;
var lastKeyDrawn = currentKey;

function startGame() {
    var snake = [];
    var snakePositions = makeBoard(boardSize);
    var snakeBody = new SnakeBody(canvas, boardSize / 2, boardSize / 2);
    snakePositions[boardSize / 2][boardSize / 2] = 1;
    var foodPosition = getRandomFoodPosition(snakePositions);
    snake.push(snakeBody);
    var isGameOver = false;
    return {
        snake,
        foodPosition,
        snakePositions,
        isGameOver
    };
}

function update(progress) {
    if (isGameOver) {
        return;
    }
    currentFrameTime += progress;

    if (currentFrameTime > frameTime) {
        var snakeHead = snake[snake.length - 1];

        if (foodPosition[0] == snakeHead.posX && foodPosition[1] == snakeHead.posY) {
            foodPosition = getRandomFoodPosition(snakePositions);
            frameTime -= 10;
        } else {
            var snakeEnd = snake.shift();
            snakePositions[snakeEnd.posX][snakeEnd.posY] = 0;
        }

        var nextXPos = snakeHead.posX;
        var nextYPos = snakeHead.posY;

        switch (currentKey) {
            case upKey:
                nextYPos--;
                break;
            case downKey:
                nextYPos++;
                break;
            case leftKey:
                nextXPos--;
                break;
            case rightKey:
                nextXPos++;
                break;
        }

        lastKeyDrawn = currentKey;

        if (nextXPos < 0 || nextXPos == boardSize || nextYPos < 0 || nextYPos == boardSize) {
            isGameOver = true;
            drawText("Game Over!\nPress space");
        } else {
            snake.push(new SnakeBody(canvas, nextXPos, nextYPos))
            snakePositions[nextXPos][nextYPos] = 1;
            currentFrameTime = 0;
        }
    }
}

function draw() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    var food = new Food(canvas, foodPosition[0], foodPosition[1]);
    snake.forEach(snakeBody => {
        snakeBody.draw();
    });

    food.draw();
}

function loop(timestamp) {
    var progress = timestamp - lastRender

    update(progress)
    if (!isGameOver) {
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
    console.log(e.keyCode + " " + e.code);
    if (validMoveKeys.includes(requestedKey)) {
        if ((lastKeyDrawn == upKey && requestedKey != downKey) ||
            (lastKeyDrawn == downKey && requestedKey != upKey) ||
            (lastKeyDrawn == leftKey && requestedKey != rightKey) ||
            (lastKeyDrawn == rightKey && requestedKey != leftKey)) {
            currentKey = requestedKey;
            return;
        }
    }

    if (isGameOver && requestedKey == spaceKey) {
        var newGame = startGame();
        snake = newGame.snake;
        foodPosition = newGame.foodPosition;
        snakePositions = newGame.snakePositions;
        isGameOver = newGame.isGameOver;
    }
}

function makeBoard(boardSize) {
    return Array.from({
            length: boardSize
        }, () =>
        Array.from({
            length: boardSize
        }, () => 0)
    );
}

function getRandomFoodPosition(snakePositions) {
    var size = snakePositions.length;

    var foodPosition = [];

    do {
        foodPosition[0] = Math.floor(Math.random() * Math.floor(size));
        foodPosition[1] = Math.floor(Math.random() * Math.floor(size));
    } while (snakePositions[foodPosition[0]][foodPosition[1]] == 1);

    return foodPosition;
}

function drawText(text) {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";

    const lineHeight = canvas.height/15;
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