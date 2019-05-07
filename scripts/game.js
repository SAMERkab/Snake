class Game {
  constructor(data) {
    this.correctData(data);

    this.boardData = data.board;
    this.snakesData = data.snakes;
    this.containerId = data.containerId;
    this.foodsArr = data.food;
    this.useAnimationFrame = data.useAnimationFrame;
    this.snakesEatEachOther = data.snakesEatEachOther;
    this.checkCutsByBoardSquare = data.checkCutsByBoardSquare;

    this.gameOver = false;
    this.snakes = [];
    this.ids = {
      "mainDiv": "mainDiv",
      "errorView": "errorView",
      "errorDiv": "errorDiv",
      "errorMsg": "errorMsg",
    };
  }

  main() {
    this.init();
    this.makeInstances();
  }

  correctData(data) {
    var namesArr = [];
    for (var i = 0; i < data.snakes.length; i++) {
      if (namesArr.includes(data.snakes[i].name)) {
        data.snakes[i].name += i;
      }
      namesArr.push(data.snakes[i].name);
    }
  }

  correctSnakeData(snakeData) {
    if (snakeData.head.col < 0) snakeData.head.col += this.board.cols;
    if (snakeData.head.row < 0) snakeData.head.row += this.board.rows;
  }

  init() {
    this.boardContainer = document.getElementById(this.ids.mainDiv);
    this.boardContainer.focus();
  }

  makeInstances() {
    this.board = new Board(this.boardContainer, this.snakesData, this.boardData);

    for (var snakeData of this.snakesData) {
      this.correctSnakeData(snakeData);
      this.snakes.push(new Snake(this.board, snakeData));
    }

    this.food = new Food("random", this.board, this.foodsArr);
  }

  getSnakeData(snakeName) {
    for (var snakeData of this.snakesData) {
      if (snakeData.name == snakeName)
        return snakeData;
    }
    throw "There is no snake named '" + snakeName + "'.";
  }

  badData(errorMsg) {
    var container = document.getElementById(this.containerId);
    container.style.display = "none";
    var errorDiv = document.getElementById(this.ids.errorDiv);
    var p = document.getElementById(this.ids.errorMsg);
    errorDiv.style.display = "block";
    p.innerHTML = errorMsg;
  }


  /***************************** STATIC ***************************************/
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
