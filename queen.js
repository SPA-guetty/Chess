class queen extends piece {
  constructor(color, position, board) {
    super(color, position, board, 'queen');
  }

  getPossibleMoves() {
    const directions = [
      { x: 1, y: 0 }, // right
      { x: -1, y: 0 }, // left
      { x: 0, y: 1 }, // down
      { x: 0, y: -1 }, // up
      { x: 1, y: 1 }, // down right
      { x: -1, y: 1 }, // down left
      { x: 1, y: -1 }, // up right
      { x: -1, y: -1 } // up left
    ];
    return this.getStraightLineMoves(directions);
  }
}