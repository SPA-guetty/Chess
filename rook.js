class rook extends piece {
  constructor(color, x, y) {
    super(color, x, y);
    this.type = "rook";
    this.symbol = (color == "white") ? "♖" : "♜";
  }

  // Check if the move is valid
  move(x, y) {
    if (this.x == x || this.y == y) {
      return true;
    }
    return false;
  }
}
module.exports = rook;