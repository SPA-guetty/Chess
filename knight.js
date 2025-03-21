class knight extends piece {
  constructor(x, y, color) {
    super(x, y, color);
    this.type = 'knight';
    this.symbol = (color == 'white') ? '♘' : '♞';
  }

  // Check if the move is valid
  move(x, y) {
    if (Math.abs(this.x - x) == 2 && Math.abs(this.y - y) == 1) {
      return true;
    } else if (Math.abs(this.x - x) == 1 && Math.abs(this.y - y) == 2) {
      return true;
    }
    return false;
  }
}
module.exports = knight;