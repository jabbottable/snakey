const snakeBodySize = 20;
const boardSize = 20;

class Pixel {
    constructor(canvas, posX, posY, colour) {
        this.posX = posX;
        this.posY = posY;
        this.colour = colour;
        this.context = canvas.getContext("2d");
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = this.colour;

        this.context.fillRect(this.posX * snakeBodySize, this.posY * snakeBodySize, snakeBodySize - 1, snakeBodySize - 1);
        this.context.stroke();
    }
}

var canvas = document.getElementById("myCanvas");

canvas.height = boardSize * snakeBodySize;
canvas.width = boardSize * snakeBodySize;

isGameOver = true;
drawText("Welcome to Snakey!!\n\nPress space to\nbegin the adventure");

var currentFrameTime = 0;

const upKey = 38;
const downKey = 40;
const leftKey = 37;
const rightKey = 39;
const spaceKey = 32;



const validMoveKeys = [upKey, downKey, leftKey, rightKey];

var {
    snake,
    foodPosition,
    snakePositions,
    isGameOver,
    frameTime,
    currentKey
} = startGame();

var lastKeyDrawn = currentKey;

function startGame() {
    var snake = [];
    var snakePositions = makeBoard(boardSize);

    var middlePoint = boardSize / 2;

    for (let snakePosition = 3; snakePosition >= 0; snakePosition--) {
        var snakeBody = new Pixel(canvas, middlePoint - snakePosition, middlePoint, "red");
        snakePositions[middlePoint - snakePosition][middlePoint] = 1;
        snake.push(snakeBody);
    }

    var foodPosition = getRandomFoodPosition(snakePositions);
    var isGameOver = false;
    var frameTime = 200;

    var currentKey = rightKey;
    return {
        snake,
        foodPosition,
        snakePositions,
        isGameOver,
        frameTime,
        currentKey
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

        if (isSnakeOfScreen(nextXPos, nextYPos) || willSnakeEatSelf(nextXPos, nextYPos)) {
            isGameOver = true;
            drawText("Game Over!\nPress space");
        } else {
            snake.push(new Pixel(canvas, nextXPos, nextYPos, "red"))
            snakePositions[nextXPos][nextYPos] = 1;
            currentFrameTime = 0;
        }
    }
}

function willSnakeEatSelf(nextXPos, nextYPos) {
    return snakePositions[nextXPos][nextYPos] == 1;
}

function isSnakeOfScreen(nextXPos, nextYPos) {
    return nextXPos < 0 || nextXPos == boardSize || nextYPos < 0 || nextYPos == boardSize;
}

function draw() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    var food = new Pixel(canvas, foodPosition[0], foodPosition[1], "blue");
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
        frameTime = newGame.frameTime;
        currentKey = newGame.currentKey;
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