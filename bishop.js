class Bishop extends Piece {
    constructor(color, position, board) {
        super(color, position, board, 'bishop');
    }

    getPossibleMoves() {
        const directions = [
            { x: 1, y: 1 }, // down right
            { x: -1, y: 1 }, // down left
            { x: 1, y: -1 }, // up right
            { x: -1, y: -1 } // up left
        ];
        return this.getStraightLineMoves(directions);
    }
}