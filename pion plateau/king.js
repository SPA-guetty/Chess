class King extends Piece {
    constructor(color, position, board) {
        super(color, position, board, 'king');
    }

    getPossibleMoves() {
        const moves = [];
        const kingMoves = [
            { x: 1, y: 0 }, // right
            { x: -1, y: 0 }, // left
            { x: 0, y: 1 }, // down
            { x: 0, y: -1 }, // up
            { x: 1, y: 1 }, // down right
            { x: -1, y: 1 }, // down left
            { x: 1, y: -1 }, // up right
            { x: -1, y: -1 } // up left
        ];

        kingMoves.forEach(offset => {
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

        // Castle
        if (!this.hasMoved && !this.board.checkState[this.color]) {
            // Castle short
            const kingsideRook = this.board.squares[this.position.x][7];
            if (kingsideRook instanceof Rook && !kingsideRook.hasMoved) {
                const emptyBetween = [5, 6].every(y =>
                    this.board.isSquareEmpty({x: this.position.x, y})
                );
                const notUnderAttack = [5, 6].every(y =>
                    !this.board.isPositionUnderAttack({ x: this.position.x, y }, this.color === 'white' ? 'black' : 'white')
                );
                
                if (emptyBetween && notUnderAttack) {
                    moves.push({ x: this.position.x, y: 6 });
                }
            }
            
            // Castle long
            const queensideRook = this.board.squares[this.position.x][0];
            if (queensideRook instanceof Rook && !queensideRook.hasMoved) {
                const emptyBetween = [1, 2, 3].every(y =>
                    this.board.isSquareEmpty({ x: this.position.x, y })
                );
                const notUnderAttack = [1, 2].every(y =>
                    !this.board.isPositionUnderAttack({ x: this.position.x, y }, this.color === 'white' ? 'black' : 'white')
                );
                if (emptyBetween && notUnderAttack) {
                    moves.push({ x: this.position.x, y: 2 });
                }
            }
        }
        return moves;
    }
}