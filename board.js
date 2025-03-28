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

    updateCheckState() {
        const kingPositions = {
            white: this.pieces.find(p => p instanceof King && p.color === 'white')?.position,
            black: this.pieces.find(p => p instanceof King && p.color === 'black')?.position,
        }
        this.checkState.white = this.isPositionUnderAttack(kingPositions.white, 'black');
        this.checkState.black = this.isPositionUnderAttack(kingPositions.black, 'white');
    }

    isPositionUnderAttack(position, byColor) {
        if (!position) return false;
        return this.pieces.some(piece => {
            if (piece.color !== byColor) return false;
            if (piece instanceof Pawn) {
                const direction = piece.color === 'white' ? -1 : 1;
                return (Math.abs(piece.position.y - position.y) === 1 &&
                    (piece.position.x + direction === position.x))
            }
            return piece.getPossibleMoves().some(move => move.x === position.x && move.y === position.y);
        })
    }

    updateGameState() {
        const currentColor = this.currentPlayer;
        const opponentColor = currentColor === 'white' ? 'black' : 'white';

        // Check for any legal moves
        const hasLegalMoves = this.pieces.some(piece =>
            piece.color === opponentColor && piece.getLegalMoves().length > 0
        );
        if (!hasLegalMoves) {
            if (this.checkState[opponentColor]) {
                this.gameState = `checkmate`;
            } else {
                this.gameState = 'stalemate';
            }
        }
    }

    wouldMoveCauseCheck(from, to, color) {
        // Simulates a move
        const originalFromPiece = this.squares[from.x][from.y];
        const originalToPiece = this.squares[to.x][to.y];
        this.squares[from.x][from.y] = null;
        this.squares[to.x][to.y] = originalFromPiece;

        // Check if the king of the moving color is in check
        const kingPosition = this.pieces.find(p => p instanceof King && p.color === color)?.position;
        const isInCheck = kingPosition ? this.isPositionUnderAttack(kingPosition, color === 'white' ? 'black' : 'white') : false;

        // Ends the simulation
        this.squares[from.x][from.y] = originalFromPiece;
        this.squares[to.x][to.y] = originalToPiece;

        return isInCheck;
    }
}