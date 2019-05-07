class Table {
  constructor(defaultData) {
    this.defaultData = defaultData;
    this.data = {};
    this.init();
  }

  init() {
    if (this.defaultData) {
      if (this.defaultData instanceof Table) {
        this.data = defaultData.assign({}, this.defaultData.data);
      } else {
        for (var col in this.defaultData) {
          this.addData(col, this.defaultData[col]);
        }
      }
    }
  }

  addData(col, row) {
    if (this.data[col]) {
      if (this.data[col][row])
        this.data[col][row]++;
      else
        this.data[col][row] = 1;
    } else {
      this.data[col] = {[row]: 1};
    }
  }

  removeData(col, row) {
    switch(this.hasData(col, row)) {
      case undefined:
        throw "There is nothing at row: " + row + ", column: " + col + " in this table.";
        break;
      case 1:
        delete this.data[col][row];
        break;
      default:
        this.data[col][row]--;
    }
  }

  hasData(col, row) {
    return this.data[col] && this.data[col][row];
  }
}
