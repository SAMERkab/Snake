class Snake {
  constructor(board, data) {
    this.board = board;
    this.ctx = board.canvas.getContext("2d");
    this.headData = data.head;

    this.name = data.name;
    this.cellSize = data.cellSize;
    this.headColor = data.headColor || data.color;
    this.headImageURL = data.headImageURL;
    this.color = data.color;
    this.cellShape = data.cellShape;
    this.roundnessRatio = data.roundnessRatio || 0.3;
    this.speed = data.speed;
    this.step = data.step;
    this.growth = data.growth;
    this.growingToLength = data.beginningLength;
    this.moveButtons = data.moveButtons;
    this.pauseButton = data.pauseButton || " ";
    this.canEatItSelf = data.canEatItSelf;
    this.reviveAfterDeath = data.reviveAfterDeath;

    this.init();
  }

  init() {
    this.head = new Head(this, this.headData);

    this.sizeDiff = (this.head.size - this.cellSize) / 2;
    this.moveDelay = 1000 / (this.speed);
    this.squareBySteps =
      (this.step < this.board.squareLength) ?
      (this.board.squareLength / this.step) : 1;
    this.stepCounter = this.squareBySteps;
    this.length = 0;
    this.eatenCount = 0;
    this.deaths = 0;
    this.hasStarted = false;
    this.cellsArr = [];
    this.cellsTable = new Table();
    this.occupiedSquares = new Table({[this.head.col]: this.head.row});//the first occupied square is the head itself
    this.angles = {left: "270deg", up: "0deg", right: "90deg", down: "180deg"};
    this.moveCommands = [];

    if (game.useAnimationFrame) {
      this.speed = (this.speed > 60) ? 60 : this.speed;
      this.eachNthFrame = Math.round((1000 / this.speed) / 16.66);
      this.frameCount = this.eachNthFrame;
    }

    this.initButtons();
    this.initFirstClick();
    this.makeCellPath();
  }

  makeCellPath() {
    this.cell = new Path2D();
    this.drawCellToPath(
      this.cell,
      this.sizeDiff + this.head.sizeDiff,
      this.sizeDiff + this.head.sizeDiff,
      this.cellSize,
      this.cellShape
    );
  }

  drawCellToPath(path, x, y, size, type) {
    switch (type) {
      case "roundedSquare":
        Snake.roundedRect(path, x, y, size, size, this.roundnessRatio*size);
        break;
      case "circle":
        path.arc(x + size/2, y + size/2, size/2, 0, 2*Math.PI);
        break;
      default:
        path.rect(x, y, size, size);
    }
  }

  drawCell(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = this.color;
    this.ctx.fill(this.cell);
    this.ctx.restore();
  }

  initButtons() {
    this.board.container.addEventListener("keydown", (e) => {
      if (e.key in this.moveButtons) {
        this.addCommand(this.moveButtons[e.key]);
      } else if (e.key == this.pauseButton) {
        if (this.hasStarted) {
          if (this.isPaused)
            this.start();
          else
            this.pause();
        }
      }
    });
  }

  addCommand(c) {
    if (this.moveCommands.length < 2) {
      var d = this.moveCommands.length == 0 ? this.head.direction : this.moveCommands[0];
      switch (d) {
        case "left":
        case "right":
          if (c == "up" || c == "down") this.moveCommands.push(c);
          break;
        case "up":
        case "down":
          if (c == "left" || c == "right") this.moveCommands.push(c);
          break;
      }
    }
  }

  initFirstClick() {
    document.addEventListener("keydown", (e) => {
      if (e.key in this.moveButtons) {
        this.head.direction = this.moveButtons[e.key];
        this.start();
        this.hasStarted = true;
      } else {
        this.initFirstClick();
      }
    }, {once: true});
  }

  start() {
    if (!this.isDead) {

      this.isPaused = false;
      if (game.useAnimationFrame) {
        this.mainLoopAnimationFrame = requestAnimationFrame(this.animationFrameWrapper.bind(this), this.board.canvas);
      } else {
        this.mainLoopInterval = setInterval(this.mainLoop.bind(this), this.moveDelay);
      }

    }
  }

  pause() {
    this.isPaused = true;
    if (game.useAnimationFrame) {
      cancelAnimationFrame(this.mainLoopAnimationFrame);
    } else {
      clearInterval(this.mainLoopInterval);
    }
  }

  animationFrameWrapper() {
    if (this.frameCount == this.eachNthFrame) {
      this.frameCount = 0;
      this.mainLoop();
    }
    this.frameCount++;

    if (!this.isPaused && !this.isDead)
      this.mainLoopAnimationFrame = requestAnimationFrame(this.animationFrameWrapper.bind(this));
  }

  mainLoop() {
    if (this.moveCommands.length && this.head.isAllowedToTurn()) {
      this.head.direction = this.moveCommands.shift();
    }
    this.move();
    game.food.check(this);
    this.checkStillAlive();
  }

  move() {
    this.drawCell(this.head.x, this.head.y);
    this.length++;
    this.cellsArr.push({
      x: this.head.x,
      y: this.head.y,
      col: this.head.col,
      row: this.head.row,
      dir: this.head.direction
    });
    this.cellsTable.addData(this.head.x, this.head.y);

    if (this.stepCounter >= this.squareBySteps) {//!(this.head.x % this.board.squareLength) && !(this.head.y % this.board.squareLength)
      this.stepCounter = 0;
      this.head.updateCoords(true);
      this.occupiedSquares.addData(this.head.col, this.head.row);
    } else {
      this.head.updateCoords();
    }
    this.head.move();
    if (this.growingToLength < this.length) this.clearLastCell();
    this.stepCounter++;
  }

  clearLastCell(dontRepairTail) {
    this.length--;
    var lastCell = this.cellsArr.shift();

    this.cellsTable.removeData(lastCell.x, lastCell.y);
    if (this.occupiedSquares.hasData(lastCell.col, lastCell.row))
      this.occupiedSquares.removeData(lastCell.col, lastCell.row);

    if (this.cellsArr.length == 0) {
      this.ctx.clearRect(lastCell.x, lastCell.y, this.board.squareLength, this.board.squareLength);
    } else {
      var beforeLast = this.cellsArr[0];
      if (this.step >= this.cellSize) {
        this.ctx.clearRect(lastCell.x, lastCell.y, this.board.squareLength, this.board.squareLength);
      } else {
        this.clearCellAt(lastCell.x, lastCell.y, lastCell.dir);
      }
      if (!dontRepairTail) this.repairTail();
    }
  }

  repairTail() {
    var cellsCount = Math.min(this.cellSize / this.step, this.length);
    for (var i = 0; i < cellsCount; i++) {
      var c = this.cellsArr[i];
      this.drawCell(c.x, c.y);
    }
  }

  clearCellAt(x, y, direction) {
    var width, height;
    switch (direction) {
      case "left":
        x = x + this.cellSize/2 - this.step;
        width = this.cellSize/2 + this.step;
        height = this.cellSize;
        break;
      case "up":
        y = y + this.cellSize/2 - this.step;
        height = this.cellSize/2 + this.step;
        width = this.cellSize;
        break;
      case "right":
        width = this.cellSize/2 + this.step;
        height = this.cellSize;
        break;
      case "down":
        height = this.cellSize/2 + this.step;
        width = this.cellSize;
        break;
    }
    this.ctx.clearRect(x+this.sizeDiff, y+this.sizeDiff, width, height);
  }

  cutsAnotherSnake() {
    for (var snake of game.snakes) {
      if (snake.name != this.name && this.head.cutsSnake(snake)) {
        this.cuttedSnake = snake;
        return true;
      }
    }
    if (this.cuttedSnake) this.cuttedSnake = null;
    return false;
  }

  checkStillAlive() {
    if (this.board.noBorders) {
      if (!this.head.isInBoard(false)) this.head.appearFromTheOtherSide();
    } else {
      if (!this.head.isInBoard(true)) this.die();
    }

    if (this.head.cutsSnake(this)) {
      if (this.canEatItSelf) this.eatSnake(this);
      else this.die();
    }

    if (this.cutsAnotherSnake()) {
      if (game.snakesEatEachOther) this.eatSnake(this.cuttedSnake);
      else this.die();
    }

  }

  eatFood(food) {
    var growth;
    if (food.growth)
      growth = food.growth * this.squareBySteps;
    else
      growth = this.growth;
    this.eatenCount++;
    this.grow(growth);
    console.log(this.name+" ate one "+food.name+" at  Col: "+food.col+", Row: "+food.row+".");
  }

  getIndexOfCellAt(coords) {
    var i = 0;
    try {
      if (coords.col != undefined && coords.row != undefined) {
        while (this.cellsArr[i].col != coords.col || this.cellsArr[i].row != coords.row) {
          i++;
        }
      } else {
        while (this.cellsArr[i].x != coords.x || this.cellsArr[i].y != coords.y) {
          i++;
        }
      }
    }
    catch(err) {
      return undefined;
    }
    return i;
  }

  redrawCellsAt(coords) {
    var startIndex = this.getIndexOfCellAt(coords), endIndex;

    if (coords.col != undefined && coords.row != undefined)
      startIndex += Math.floor((this.squareBySteps/2) - 1);
    else
			startIndex -= Math.floor((this.squareBySteps/2) - 1);

		endIndex = Math.min(startIndex + this.squareBySteps, this.length-1);

    for (var i = startIndex; i < endIndex; i++) {
      var cell = this.cellsArr[i];
      this.drawCell(cell.x, cell.y);
    }
  }

  eatSnake(snake) {
    var newLength;
    if (game.checkCutsByBoardSquare)
      newLength = snake.length - snake.getIndexOfCellAt({col: this.head.col, row: this.head.row}) - 2*this.squareBySteps;
    else
      newLength = snake.length - snake.getIndexOfCellAt({x: this.head.x, y: this.head.y}) - this.squareBySteps - 1;

    if (snake.length == 0 || isNaN(newLength)) return;

    this.pause();
    if (snake.name != this.name) snake.pause();

    snake.shrinkTo(newLength, () => {//this callback redraws the cells near the head of this snake
      var snakeLength = this.length;
      var len = Math.min(this.squareBySteps, snakeLength)
      for (var i = 1; i < len; i++) {
        var cell = this.cellsArr[snakeLength - i];
        this.drawCell(cell.x, cell.y);
      }
      this.start();
      if (snake.name != this.name && !snake.isDead) snake.start();
    });
  }

  grow(n) {
    this.growingToLength += n;
  }

  shrinkTo(length, callback) {
    if (length < 0) length = 0;
    this.growingToLength = length;
    var interval = setInterval(() => {
      if (this.length <= length + (game.snakesEatEachOther ? 1 : 0)) {
        clearInterval(interval);
        if (callback) callback();
      } else {
        this.clearLastCell();
      }
    }, Math.ceil(1000/(this.speed*5)));
  }

  die() {
    console.log(this.name+" died.");

    if (game.useAnimationFrame)
      cancelAnimationFrame(this.mainLoopAnimationFrame);
    else
      clearInterval(this.mainLoopInterval);

    this.head.switchDeadHead();

    this.isDead = true;
    this.deathCoords = game.checkCutsByBoardSquare ?
      {col: this.head.col, row: this.head.row} :
      {x: this.head.x, y: this.head.y};

    if (this.reviveAfterDeath)
      setTimeout(() => {this.revive();}, 100);
    else {
      this.shrinkTo(0, () => {
        this.occupiedSquares = new Table();
        if (this.cuttedSnake) {
          this.cuttedSnake.redrawCellsAt(this.deathCoords);
        }
        this.head.disappear();
      });
    }
  }

  revive() {
    if (!this.isDead) this.die();
    var snakeData = game.getSnakeData(this.name);

    this.initFirstClick();
    this.head.col = snakeData.head.col;
    this.head.row = snakeData.head.row;
    this.head.x = this.head.col * this.board.squareLength;
    this.head.y = this.head.row * this.board.squareLength;
    this.head.direction = this.head.defaultDirection;

    this.shrinkTo(0, () => {
      this.head.switchDeadHead();
      this.head.move();
      this.grow(snakeData.beginningLength);
      this.occupiedSquares = new Table({[this.head.col]: this.head.row});
      this.deaths++;
      this.hasStarted = false;
      this.isDead = false;
      if (this.cuttedSnake) {
        this.cuttedSnake.redrawCellsAt(this.deathCoords);
      }
    });
  }

/******************************************************************************/

static roundedRect(ctx, x, y, width, height, radius) {
  var min = Math.min(width, height);
  if (radius > min / 2) radius = min / 2;
  if (radius < 0) radius = 0;

  if (!ctx instanceof Path2D) ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height-radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
}

}//end
