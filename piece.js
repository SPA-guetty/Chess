class Piece {
    constructor(color, position, board, type) {
        this.color = color; // white or black
        this.position = position; // [x, y]
        this.board = board; // 2D array
        this.type = type; // pawn, rook, knight, bishop, queen, king
        this.hasMoved = false; 
    }

    getPossibleMoves() {
        throw new Error('Method getPossibleMoves() must be implemented');
    }

    getLegalMoves() {
        const PossibleMoves = this.getPossibleMoves();
        return 
    }
}