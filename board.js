class Board {
    constructor(variant = 'standard') {
        this.variant = variant;
        this.squares = this.createEmptyBoard();
        this.pieces = [];
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameState = 'active'; // active, check, checkmate, stalemate
        this.initializePieces();
    }

    createEmptyBoard() {
        return Array(8).fill(null).map(() => Array(8).fill(null));
    }

    initializePieces() {
        if (this.variant === 'standard') {
            this.setupStandardGame();
        }
    }

    setupStandardGame() {
        this.pieces.push(new Rook('white', 0, 0));
        this.pieces.push(new Knight('white', 1, 0));
        this.pieces.push(new Bishop('white', 2, 0));
        this.pieces.push(new Queen('white', 3, 0));
        this.pieces.push(new King('white', 4, 0));
        this.pieces.push(new Bishop('white', 5, 0));
        this.pieces.push(new Knight('white', 6, 0));
        this.pieces.push(new Rook('white', 7, 0));
        for (let i = 0; i < 8; i++) {
            this.pieces.push(new Pawn('white', i, 1));
        }
        this.pieces.push(new Rook('black', 0, 7));
        this.pieces.push(new Knight('black', 1, 7));
        this.pieces.push(new Bishop('black', 2, 7));
        this.pieces.push(new Queen('black', 3, 7));
        this.pieces.push(new King('black', 4, 7));
        this.pieces.push(new Bishop('black', 5, 7));
        this.pieces.push(new Knight('black', 6, 7));
        this.pieces.push(new Rook('black', 7, 7));
        for (let i = 0; i < 8; i++) {
            this.pieces.push(new Pawn('black', i, 6));
        }
        this.pieces.forEach(piece => {
            this.squares[piece.x][piece.y] = piece;
        });
    }

    movePiece(from, to) {
        const piece = this.squares[from.x][from.y];
        if (piece == null) {
            return false;
        }
        if (piece.color !== this.currentPlayer) {
            return false;
        }
        if (!piece.move(to.x, to.y)) {
            return false;
        }
        if (this.squares[to.x][to.y] != null) {
            if (this.squares[to.x][to.y].color === this.currentPlayer) {
                return false;
            }
        }
        this.squares[from.x][from.y] = null;
        this.squares[to.x][to.y] = piece;
        this.moveHistory.push({ from, to });
        this.currentPlayer = (this.currentPlayer === 'white') ? 'black' : 'white';
        return true;
    }

    isCheck(color) {
        const king = this.pieces.find(piece => piece.type === 'king' && piece.color === color);
        if (king == null) {
            return false;
        }
        return this.pieces.some(piece => piece.color !== color && piece.canAttack(king.x, king.y));
    }

    isCheckmate(color) {
        if (!this.isCheck(color)) {
            return false;
        }
        return this.pieces.filter(piece => piece.color === color).every(piece => piece.allValidMoves().length === 0);
    }
}