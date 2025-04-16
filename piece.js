class Piece {
    constructor(color, position, board, type) {
        this.color = color; // white or black
        this.position = position; // [x, y]
        this.board = board; 
        this.type = type; // pawn, rook, knight, bishop, queen, king
        this.hasMoved = false; 
    }

    getLegalMoves() {
        // Get moves that are physically possible
        let possibleMoves = this.getPossibleMoves();
        console.log(`${this.color} ${this.type} at (${this.position.x},${this.position.y}) has ${possibleMoves.length} possible moves`);
        
        // Filter out moves that would leave the king in check
        const legalMoves = possibleMoves.filter(move => {
            const wouldCauseCheck = this.board.wouldMoveCauseCheck(this.position, move, this.color);
            if (wouldCauseCheck) {
                console.log(`Move to (${move.x},${move.y}) would leave king in check`);
            }
            return !wouldCauseCheck;
        });
        
        console.log(`${this.color} ${this.type} at (${this.position.x},${this.position.y}) has ${legalMoves.length} legal moves`);
        return legalMoves;
    }

    getPossibleMoves() {
        throw new Error("Method getPossibleMoves() must be implemented in derived classes");
    }

    getStraightLineMoves(directions) {
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