const upKey = 38;
const downKey = 40;
const leftKey = 37;
const rightKey = 39;
const spaceKey = 32;

class Game {
    constructor(boardSize) {
        this.resetGame(boardSize)
        this.highScore = 0;
    }

    resetGame(boardSize) {        
        this.snake = [];
        this.snakePositions = makeBoard(boardSize);
    
        var middlePoint = boardSize / 2;
    
        for (let snakePosition = 3; snakePosition >= 0; snakePosition--) {
            var snakeBody = new Pixel(canvas, middlePoint - snakePosition, middlePoint, "red");
            this.snakePositions[middlePoint - snakePosition][middlePoint] = 1;
            this.snake.push(snakeBody);
        }
    
        this.getNewRandomFoodPosition(this.snakePositions);
        this.isGameOver = false;
        this.frameTime = 150;
        this.score = 0;
        this.currentKey = rightKey;
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
        return { nextXPos, nextYPos };
    }

    willSnakeEatSelf(nextXPos, nextYPos) {
        return this.snakePositions[nextXPos][nextYPos] == 1;
    }
}

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

var currentFrameTime = 0;

const validMoveKeys = [upKey, downKey, leftKey, rightKey];

var game = new Game(boardSize);

game.isGameOver = true;
drawText("Welcome to Snakey!!\n\nPress space to\nbegin the adventure");

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

        var { nextXPos, nextYPos } = game.getNextPositions();
        game.lastKeyDrawn = game.currentKey;

        if (isSnakeOfScreen(nextXPos, nextYPos) || game.willSnakeEatSelf(nextXPos, nextYPos)) {
            if(game.score > game.highScore) {
                game.highScore = game.score;
                updateHighScore(game.highScore)
            }
            game.isGameOver = true;
            drawText("Game Over!\nPress space");
        } else {
            game.snake.push(new Pixel(canvas, nextXPos, nextYPos, "red"))
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
    var food = new Pixel(canvas, game.foodPosition[0], game.foodPosition[1], "blue");
    game.snake.forEach(snakeBody => {
        snakeBody.draw();
    });

    food.draw();
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

    if (validMoveKeys.includes(requestedKey)) {
        if ((game.lastKeyDrawn == upKey && requestedKey != downKey) ||
            (game.lastKeyDrawn == downKey && requestedKey != upKey) ||
            (game.lastKeyDrawn == leftKey && requestedKey != rightKey) ||
            (game.lastKeyDrawn == rightKey && requestedKey != leftKey)) {
            game.currentKey = requestedKey;
            return; 
        }
    }

    if (game.isGameOver && requestedKey == spaceKey) {
        game.resetGame(boardSize);
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

function updateScore(score) {
    var scoreElement = document.getElementById("score");
    scoreElement.innerHTML = "Score = " + score;
}

function updateHighScore(score) {
    var scoreElement = document.getElementById("highScore");
    scoreElement.innerHTML = "High score = " + score;
}