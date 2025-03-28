class Board {
    constructor(variant = 'standard') {
        this.variant = variant;
        this.squares = this.createEmptyBoard();
        this.pieces = [];
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameState = 'active'; // active, check, checkmate, stalemate
        this.initializePieces();
        this.checkState = {white: false, black: false};
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

    getPiece(position) {
        if(this.isPositionValid(position)) {
            return this.squares[position.x][position.y];
        }
        return null;
    }

    isPositionValid(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    isSquareEmpty(position) {
        return this.squares[position.x][position.y] == null;
    }

    isSquareOccupiedByColor(position, color) {
        return this.isPositionValid(position) &&
            this.squares[position.x][position.y] != null &&
            this.squares[position.x][position.y].color === color;
    }

    movePiece(from, to, promotionType = null) {
        if (!this.isPositionValid(from) || !this.isPositionValid(to)) {
            return false;
        }
        const piece = this.squares[from.x][from.y];
        if (piece == null || piece.color !== this.currentPlayer) {
            return false;
        }

        // Check if the move is legal
        const legalMoves = piece.getLegalMoves();
        const isLegal = legalMoves.some(move => move.x === to.x && move.y === to.y);
        if (!isLegal) {
            return false;
        }

        // Check if the move is en passant
        if (piece instanceof Pawn && Math.abs(from.y - to.y) === 1 && this.isSquareEmpty(to)) {
            // En passant
            const takenPawnPos = {x: from.x, y: to.y};
            this.squares[takenPawnPos.x][takenPawnPos.y] = null;
        }

        // Implementing castling
        if (piece instanceof King && Math.abs(from.y - to.y) === 2) {
            // Castling
            const rookFromY = to.y > from.y ? 7 : 0;
            const rookToY = to.y > from.y ? to.y - 1 : to.y + 1;
            const rook = this.squares[from.x][rookFromY];

            this.squares[from.x][rookFromY] = null;
            this.squares[from.x][rookToY] = rook;
            rook.position = {x: from.x, y: rookToY};
            rook.hasMoved = true;
        }

        // Moving the piece
        this.squares[from.x][from.y] = null;

        // Check if the move is a promotion
        if (piece instanceof Pawn && (to.x === 0 || to.x === 7)) {
            const promotedPiece = this.createPromotedPiece(promotionType, piece.color, to);
            this.squares[to.x][to.y] = promotedPiece;
            this.pieces = this.pieces.filter(p => p !== piece);
            this.pieces.push(promotedPiece);
        } else {
            this.squares[to.x][to.y] = piece;
            piece.position = to;
            piece.hasMoved = true;
        }

        // Update the move history
        this.moveHistory.push({
            from,
            to,
            piece: piece.type,
            color: piece.color,
            captured: this.getPiece(to)?.type,
            promotion: promotionType,
        });

        // Check for check
        this.updateCheckState();

        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check game status
        this.updateGameState();

        return true;
    }

    createPromotedPiece(type, color, position) {
        switch (type.tolowerCase()) {
            case 'queen': return new Queen(color, position, this);
            case 'rook': return new Rook(color, position, this);
            case 'bishop': return new Bishop(color, position, this);
            case 'knight': return new Knight(color, position, this);
            default: return new Queen(color, position, this); 
        }
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