class Piece {
    constructor(color, position, board, type) {
        this.color = color; // white or black
        this.position = position; // [x, y]
        this.board = board; // 2D array
        this.type = type; // pawn, rook, knight, bishop, queen, king
        this.hasMoved = false; 
    }

    getLegalMoves() {
        const possibleMoves = this.getLegalMoves();
        return possibleMoves.filter(move =>
            !this.board.wouldMoveCauseCheck(this.position, move, this.color)
        );
    }

    getPossibleMoves() {
        throw new Error("Method getPossibleMoves() must be implemented in derived classes");
    }

    getStraightLineMoves() {
        const moves = [];
        for (const dir of directions) {
            let newPos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            while (this.board.isPositionValid(newPos)) {
                if (this.board.isSquareEmpty(newPos)) {
                    moves.push({...newPos});
                } else {
                    if (this.board.squares[newPos.x][newPos.y].color !== this.color) {
                        moves.push({...newPos});
                    }
                    break; // Stop if we hit a piece
                }
                newPos = {
                    x: newPos.x + dir.x,
                    y: newPos.y + dir.y
                };
            }
        }
        return moves;
    }
}