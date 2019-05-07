class Board {
  constructor(container, snakesData, boardData) {
    this.container = container;
    this.snakesData = snakesData;

    this.noBorders = boardData.noBorders;
    this.cols = boardData.cols;
    this.rows = boardData.rows;
    this.eachNthStep = boardData.eachNthStep;
    this.bgColor = boardData.bgColor;

    this.borderWidth = boardData.borderWidth;
    this.borderStyle = boardData.borderStyle;
    this.borderColor = boardData.borderColor;

    this.showSquares = boardData.showSquares;

    if (this.calcProps()) {
      this.init();
    } else {
      game.badData("The properties 'headSize' and 'step' of different snakes are not compatible with each other");
    }
  }

  calcProps() {
    var squareLengthsArr = [];
    for (let snakeData of this.snakesData) {
      squareLengthsArr.push((snakeData.step < snakeData.head.size) ?
        snakeData.head.size + (this.eachNthStep - 1) * snakeData.step :
        snakeData.step * this.eachNthStep);
    }

    if (squareLengthsArr.every((sl) => {return sl == squareLengthsArr[0]})) {//all snakes have the same squareLength
      this.squareLength = squareLengthsArr[0];

      if (this.cols == "max" || (this.cols*this.squareLength+2*this.borderWidth > window.innerWidth))
        this.cols = Math.floor((window.innerWidth - 2*this.borderWidth) / this.squareLength);

      if (this.rows == "max" || (this.rows*this.squareLength+2*this.borderWidth > window.innerHeight))
        this.rows = Math.floor((window.innerHeight - 2*this.borderWidth) / this.squareLength);

      this.width = this.cols * this.squareLength;
      this.height = this.rows * this.squareLength;

      return true;
    }
    return false;
  }

  init() {
    this.boardElem = document.createElement("div");
    Object.assign(this.boardElem.style, {
      "position": "absolute",
      "width": this.width + "px",
      "height": this.height + "px",
    	"top": "50%",
    	"left": "50%",
    	"transform": "translate(-50%, -50%)",
      "outline": this.borderWidth+"px "+this.borderStyle+" "+this.borderColor,
      "overflow": this.noBorders ? "hidden" : "visible",
    });
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.backgroundColor = this.bgColor;
    if (this.showSquares) this.showBoardSquares();

    this.boardElem.appendChild(this.canvas);
    this.container.appendChild(this.boardElem);
  }

  showBoardSquares() {
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    this.drawBoardSquares(tempCanvas.getContext("2d"), "#999", "#ccc");
    var url = tempCanvas.toDataURL();
    this.canvas.style.backgroundImage = "url(" + url + ")";
  }

  appendChild(elem) {
    this.boardElem.appendChild(elem);
  }

  isFreeSquare(col, row) {
    for (var snake of game.snakes) {
      if (snake.occupiedSquares.hasData(col, row))
        return false;
    }
    return true;
  }

  drawBoardSquares(ctx, color1, color2) {
    var fillColor;
    for (var col = 0; col < this.cols; col++) {
      fillColor = (col % 2 == 0) ? color1 : color2;
      for (var row = 0; row < this.rows; row++) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(col*this.squareLength, row*this.squareLength, this.squareLength, this.squareLength);
        fillColor = (fillColor == color1) ? color2 : color1;
      }
    }
  }
}
