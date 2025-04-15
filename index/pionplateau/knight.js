class Knight extends Piece {
    constructor(color, position, board) {
      super(color, position, board, 'knight');
    }
  
    getPossibleMoves() {
      const moves = [];
      const knightMoves = [
        { x: 2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: 1 },
        { x: -2, y: -1 },
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 }
      ];
  
      knightMoves.forEach(offset => {
        const newPos = {
          x: this.position.x + offset.x,
          y: this.position.y + offset.y
        };
  
        if (this.board.isPositionValid(newPos)) {
          if (this.board.isSquareEmpty(newPos) || 
              this.board.squares[newPos.x][newPos.y].color !== this.color) {
            moves.push(newPos);
          }
        }
      });
      return moves;
    }
  }