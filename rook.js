class rook extends piece {
  constructor(color, x, y) {
    super(color, x, y);
    this.type = "rook";
    this.symbol = (color == "white") ? "♖" : "♜";
  }

  validMove(x, y) {
    if (this.x == x && this.y != y) {
      return true;
    }
    if (this.x != x && this.y == y) {
      return true;
    }
    return false
  }

  allValidMoves() {
    const moves = [];
    for (let i = 0; i < 8; i++) {
      if (this.validMove(i, this.y)) {
        moves.push({ x: i, y: this.y });
      }
      if (this.validMove(this.x, i)) {
        moves.push({ x: this.x, y: i });
      }
    }
    return moves;
  }
}
module.exports = rook;