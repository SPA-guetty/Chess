class Rook extends Piece {
    constructor(color, position, board) {
      super(color, position, board, 'rook');
    }
  
    getPossibleMoves() {
      const directions = [
        { x: 1, y: 0 }, // right
        { x: -1, y: 0 }, // left
        { x: 0, y: 1 }, // down
        { x: 0, y: -1 } // up
      ];
      return this.getStraightLineMoves(directions);
    }
  }