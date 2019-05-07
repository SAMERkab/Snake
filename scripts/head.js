class Head {
  constructor(snake, data) {
    this.snake = snake;
    this.board = snake.board;
    this.col = data.col;
    this.row = data.row;
    this.size = data.size;
    this.color = data.color;
    this.shape = data.shape;
    this.imageURL = data.imageURL;
    this.deadImageURL = data.deadImageURL;
    this.defaultDirection = data.defaultDirection || "up";

    this.angles = {left: "270deg", up: "0deg", right: "90deg", down: "180deg"};
    this.init();
  }

  init() {
    var borderRadius;
		this.headElem = document.createElement("div");
    this.sizeDiff = Math.round((this.board.squareLength - this.size) / 2);
    this.x = this.col * this.board.squareLength;
    this.y = this.row * this.board.squareLength;
    this.direction = this.defaultDirection;

    switch (this.shape) {
      case "roundedSquare":
        borderRadius = this.snake.roundnessRatio * this.size; break;
      case "circle":
        borderRadius = this.size; break;
      default:
        borderRadius = 0;
    }

		Object.assign(this.headElem.style, {
			"position": "absolute",
			"background": this.color + (this.imageURL ? ' url("'+this.imageURL+'") center/contain no-repeat' : ''),
			"width": this.size + "px",
			"height": this.size + "px",
      "left": this.sizeDiff + "px",
      "top": this.sizeDiff + "px",
      "border-radius": borderRadius + "px",
      "box-sizing": "border-box",
      "z-index": 10,
		});

		if (this.imageURL) {
      this.headElem.style.background = "url("+this.imageURL+") no-repeat contain";
		}

		this.board.appendChild(this.headElem);
		this.move();
	}

  move() {
    var str = "translate("+this.x+"px, "+this.y+"px) rotate("+this.angles[this.direction]+")";
		this.headElem.style.transform = str;
	}

  updateCoords(rowAndCol) {
    switch (this.direction) {
      case "left":
        this.x -= this.snake.step; break;
      case "up":
        this.y -= this.snake.step; break;
      case "right":
        this.x += this.snake.step; break;
      case "down":
        this.y += this.snake.step; break;
    }
    if (rowAndCol) {
      switch (this.direction) {
        case "left":
          this.col--; break;
        case "up":
          this.row--; break;
        case "right":
          this.col++; break;
        case "down":
          this.row++; break;
      }
    }
 }

  appearFromTheOtherSide() {
    switch (this.direction) {
      case "left":
        this.x = this.board.width;
        this.col = this.board.cols-1;
        break;
      case "right":
        this.x = -this.size;
        this.col = 0;
        break;
      case "up":
        this.y = this.board.height;
        this.row = this.board.rows-1;
        break;
      case "down":
        this.y = -this.size;
        this.row = 0;
        break;
    }
    this.snake.stepCounter = 0;
    this.snake.move();
 }

  isInBoard(theWholeHead) {
    if (theWholeHead) {
      return (
        (this.x >= 0) &&
        (this.y >= 0) &&
        (this.x + this.size <= this.board.width) &&
        (this.y + this.size <= this.board.height)
        /*this.col >= 0 && this.col < this.board.cols &&
        this.row >= 0 && this.row < this.board.rows*/
      );
    }
    return (
      (this.x + this.size > 0) &&
      (this.y + this.size > 0) &&
      (this.x < this.board.width) &&
      (this.y < this.board.height)
    );
  }

  cutsSnake(snake) {
    if (game.checkCutsByBoardSquare)
      if (this.snake.name == snake.name)
        return snake.occupiedSquares.hasData(this.col, this.row) > 1;
      else
        return snake.occupiedSquares.hasData(this.col, this.row);
    return snake.cellsTable.hasData(this.x, this.y);
  }

  isAllowedToTurn() {
    if (this.direction == "left" || this.direction == "right")
      return this.x == this.col * this.board.squareLength;
    else
      return this.y == this.row * this.board.squareLength;
  }

  switchDeadHead() {
    if (this.snake.isDead) {
      if (this.deadImageURL) {
        this.headElem.style.backgroundImage = "url("+this.imageURL+")";
      } else {
        Object.assign(this.headElem.style, {
          "border": "none",
        	"background-color": this.color,
        });
      }
    } else {
      if (this.deadImageURL) {
        this.headElem.style.backgroundImage = "url("+this.deadImageURL+")";
      } else {
        Object.assign(this.headElem.style, {
          "border": "3px solid red",
        	"background-color": "#999",
        });
      }
    }
  }

  disappear() {
    //this.board.boardElem.removeChild(this.headElem);
    
  }

}
