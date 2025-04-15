class Pawn extends Piece {
    constructor(color, position, board) {
        super(color, position, board, 'pawn');
    }

    getPossibleMoves() {
        const moves = [];
        // Fix the direction - white pawns should move UP (+1 in y), black pawns DOWN (-1 in y)
        const direction = this.color === 'white' ? 1 : -1;

        // Move forward (along y-axis)
        const oneStep = { x: this.position.x, y: this.position.y + direction };
        if (this.board.isPositionValid(oneStep) && this.board.isSquareEmpty(oneStep)) {
            moves.push(oneStep);
            
            // Move two steps forward from starting position
            if (!this.hasMoved) {
                const twoSteps = { x: this.position.x, y: this.position.y + direction * 2 };
                if (this.board.isPositionValid(twoSteps) && this.board.isSquareEmpty(twoSteps)) {
                    moves.push(twoSteps);
                }
            }
        }

        // Capture diagonally
        const takeDirections = [
            { x: 1, y: direction },   // Diagonal right
            { x: -1, y: direction }   // Diagonal left
        ];

        for (const dir of takeDirections) {
            const takePos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            if (this.board.isPositionValid(takePos) && 
                !this.board.isSquareEmpty(takePos) && 
                this.board.squares[takePos.x][takePos.y].color !== this.color) {
                moves.push(takePos);
            }
            
            // Add en passant capture
            if (this.board.isPositionValid(takePos) && 
                this.board.isSquareEmpty(takePos) &&
                this.board.lastMove &&
                this.board.lastMove.piece === 'pawn' &&
                this.board.lastMove.to.x === takePos.x &&
                this.board.lastMove.to.y === this.position.y &&
                Math.abs(this.board.lastMove.from.y - this.board.lastMove.to.y) === 2) {
                moves.push(takePos);
            }
        }
        return moves;
    }
}