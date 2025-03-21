class queen extends piece {
  constructor(x, y, color) {
    super(x, y, color);
    this.name = "queen";
    this.value = 9;
  }

  move() {
    let moves = [];
    let directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (let i = 0; i < directions.length; i++) {
      let direction = directions[i];
      let x = this.x + direction[0];
      let y = this.y + direction[1];
      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] == null) {
          moves.push([x, y]);
        } else if (board[x][y].color != this.color) {
          moves.push([x, y]);
          break;
        } else {
          break;
        }
        x += direction[0];
        y += direction[1];
      }
    }
    return moves;
  }
}
module.exports = queen;