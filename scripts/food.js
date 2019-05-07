class Food {
  constructor(progressType, board, dataArr) {
    this.progressType = progressType;
    this.dataArr = dataArr;
    this.board = board;
    this.init();
  }

  init() {
    this.foodsArr = this.dataArr.map(this.newFood, this);
    this.setCurrentFood();
    this.showFood(this.currentFood);
  }

  newFood(data) {
    var radius;
    switch (data.shape) {
      case "circle":
        radius = "50%";
        break;
      case "roundedSquare":
        radius = "30%";
        break;
      default:
        radius = 0;//square
    }
    var food = document.createElement("div");
    Object.assign(food.style, {
      "position": "absolute",
      "opacity": 0,
      "background-color": data.color,
      "border-radius": radius,
      "width": data.size + "px",
      "height": data.size + "px",
      "left": "0px",
      "top": "0px"
    });
    if (data.imageURL) {
      Object.assign(food.style, {
  			"background-image": "url("+data.imageURL+")",
  			"background-repeat": "no-repeat",
  			"background-size": "contain",
  		});
    }

    this.board.appendChild(food);

    return {
      elem: food,
      name: data.name,
      size: data.size,
      sound: document.getElementById(data.soundId),
      growth: data.growth,
      snakeName: data.snakeName
    };
  }

  setCurrentFood() {
    switch (this.progressType) {
      case "random":
        this.currentFood = this.foodsArr[Game.randInt(0, this.foodsArr.length-1)];
        break;
      case "randomNoRepeat":
        this.foodsArrCopy = this.foodsArrCopy || this.foodsArr.slice();
        var randInt = Game.randInt(0, this.foodsArrCopy.length-1);
        this.currentFood = this.foodsArrCopy[randInt];
        this.foodsArrCopy.splice(randInt, 1);
        if (this.foodsArrCopy.length == 0)
          this.foodsArrCopy = this.foodsArr.slice();
        break;
      case "chronic":
        this.index = this.index || 0;
        this.currentFood = this.foodsArr[this.index];
        this.index++;
        if (this.index == this.foodsArr.length)
          this.index = 0;
        break;
      default:
        this.setCurrentFood("random");
    }
  }

  showFood(food) {
    var col, row, counter = 0;
    do {
      col = Game.randInt(0, this.board.cols - 1);
      row = Game.randInt(0, this.board.rows - 1);
      counter++;
    } while (!this.board.isFreeSquare(col, row) && counter < 1000);

    food.col = col;
    food.row = row;
    food.x = col * this.board.squareLength + (this.board.squareLength - food.size) / 2;
    food.y = row * this.board.squareLength + (this.board.squareLength - food.size) / 2;
    food.elem.style.transform = "translate(" + (food.x) + "px, " + (food.y) + "px)";
    food.elem.style.opacity = 1;
  }

  check(snake) {
    if (this.snakeEatsFood(snake, true)) {
      snake.eatFood(this.currentFood);
      this.foodIsEaten(snake);
    }
  }

  snakeEatsFood(snake, precise) {
    if (!this.currentFood.snakeName || this.currentFood.snakeName == snake.name) {
      if (precise) {
        return (
          snake.head.x < this.currentFood.x+this.currentFood.size &&
          this.currentFood.x < snake.head.x+snake.head.size &&
          snake.head.y < this.currentFood.y+this.currentFood.size &&
          this.currentFood.y < snake.head.y+snake.head.size
        )
      }
      return food.col == snake.head.col && food.row == snake.head.row;
    }
  }

  foodIsEaten(snake) {
    this.currentFood.elem.style.opacity = 0;
    this.playSound(this.currentFood);
    this.setCurrentFood();
    this.showFood(this.currentFood);
  }

  playSound(food) {
    if (food.sound) {
      if (!food.sound.paused) {
        food.sound.pause();
        food.sound.currentTime = 0;
      }
      food.sound.play();
    }
  }

}
