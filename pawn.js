class Pawn extends Piece {
    constructor(color, position, board) {
        super(color, position, board, 'pawn');
    }

    getPossibleMoves() {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;

        // Move forward
        const oneStep = { x: this.position.x + direction, y: this.position.y };
        if (this.board.isSquareEmpty(oneStep)) {
            moves.push(oneStep);
            // Move two steps forward from starting position
            if(!this.hasMoved) {
                const twoSteps = { x: this.position.x + direction * 2, y: this.position.y };
                if (this.board.isSquareEmpty(twoSteps)) {
                    moves.push(twoSteps);
                }
            }
        }

        // Capture diagonally
        const takeDirections = [
            {x: direction, y: 1},
            {x: direction, y: -1}
        ]

        for (const dir of takeDirections) {
            const takePos  = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            if (this.board.isPositionValid(takePos) && 
                !this.board.isSquareEmpty(takePos) && 
                this.board.squares[takePos.x][takePos.y].color !== this.color) {
                moves.push(takePos);
            }
        }
        return moves;
    }
}