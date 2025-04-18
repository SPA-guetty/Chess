class Board {
    constructor(variant = 'standard') {
        this.variant = variant;
        this.squares = this.createEmptyBoard();
        this.pieces = [];
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameState = 'active'; // active, check, checkmate, stalemate
        this.checkState = {white: false, black: false};
        this.lastMove = null;
        this.moveListeners = [];
        this.initializePieces();
        this.updateCheckState();
        this.updateGameState();
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
        // Create pieces with proper position objects
        this.pieces.push(new Rook('white', {x: 0, y: 0}, this));
        this.pieces.push(new Knight('white', {x: 1, y: 0}, this));
        this.pieces.push(new Bishop('white', {x: 2, y: 0}, this));
        this.pieces.push(new Queen('white', {x: 3, y: 0}, this));
        this.pieces.push(new King('white', {x: 4, y: 0}, this));
        this.pieces.push(new Bishop('white', {x: 5, y: 0}, this));
        this.pieces.push(new Knight('white', {x: 6, y: 0}, this));
        this.pieces.push(new Rook('white', {x: 7, y: 0}, this));

        for (let i = 0; i < 8; i++) {
            this.pieces.push(new Pawn('white', {x: i, y: 1}, this));
        }

        this.pieces.push(new Rook('black', {x: 0, y: 7}, this));
        this.pieces.push(new Knight('black', {x: 1, y: 7}, this));
        this.pieces.push(new Bishop('black', {x: 2, y: 7}, this));
        this.pieces.push(new Queen('black', {x: 3, y: 7}, this));
        this.pieces.push(new King('black', {x: 4, y: 7}, this));
        this.pieces.push(new Bishop('black', {x: 5, y: 7}, this));
        this.pieces.push(new Knight('black', {x: 6, y: 7}, this));
        this.pieces.push(new Rook('black', {x: 7, y: 7}, this));

        for (let i = 0; i < 8; i++) {
            this.pieces.push(new Pawn('black', {x: i, y: 6}, this));
        }


        // Place pieces on the board
        this.pieces.forEach(piece => {
            this.squares[piece.position.x][piece.position.y] = piece;
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
        return this.isPositionValid(position) && this.squares[position.x][position.y] == null;
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
        if (!piece || piece.color !== this.currentPlayer) {
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
            const takenPawnPos = {x: to.x, y: from.y};
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

        // Store if this move needs promotion
        const needsPromotion = piece instanceof Pawn && (to.y === 0 || to.y === 7) && !promotionType;

        // Moving the piece
        const originalToPiece = this.squares[to.x][to.y];
        this.squares[from.x][from.y] = null;

        // Check for capture and remove from pieces array
        if (originalToPiece) {
            this.pieces = this.pieces.filter(p => p !== originalToPiece);
        }

        // Check if the move is a promotion
        if (piece instanceof Pawn && (to.x === 0 || to.x === 7)) {
            if (promotionType) {
                const promotedPiece = this.createPromotedPiece(promotionType, piece.color, to);
                this.squares[to.x][to.y] = promotedPiece;
                this.pieces = this.pieces.filter(p => p !== piece);
                this.pieces.push(promotedPiece);
            } else {
                // If no promotion type is specified yet, put the pawn back temporarily
                this.squares[to.x][to.y] = piece;
                piece.position = to;
            }
        } else {
            this.squares[to.x][to.y] = piece;
            piece.position = to;
            piece.hasMoved = true;
        }

        // Update the move history and track last move
        const moveData = {
            from,
            to,
            piece: piece.type,
            color: piece.color,
            captured: this.getPiece(to)?.type,
            promotion: promotionType,
        };
        
        this.moveHistory.push(moveData);
        this.lastMove = moveData;

        // Check for check
        this.updateCheckState();

        // Only switch players if promotion is complete or not needed
        if (!needsPromotion) {
            // Switch players
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            
            // Check game status
            this.updateGameState();
        }

        // Notify all listeners that a move was made
        this.moveListeners.forEach(listener => listener(from, to));

        return true;
    }

    createPromotedPiece(type, color, position) {
        switch (type.toLowerCase()) {
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
        };
        this.checkState.white = this.isPositionUnderAttack(kingPositions.white, 'black');
        this.checkState.black = this.isPositionUnderAttack(kingPositions.black, 'white');
    }

    isPositionUnderAttack(position, byColor) {
        if (!position) return false;
        return this.pieces.some(piece => {
            if (piece.color !== byColor) return false;
            
            if (piece instanceof Pawn) {
                const direction = piece.color === 'white' ? 1 : -1;
                return (position.y - piece.position.y === direction) && 
                       Math.abs(position.x - piece.position.x) === 1;
            }
            
            return piece.getPossibleMoves().some(move => 
                move.x === position.x && move.y === position.y
            );
        });
    }

    updateGameState() {
        const currentColor = this.currentPlayer;
        const opponentColor = currentColor === 'white' ? 'black' : 'white';

        // Check for any legal moves
        let hasLegalMoves = false;
        for (const piece of this.pieces) {
            if (piece.color === currentColor && piece.getLegalMoves().length > 0) {
                hasLegalMoves = true;
                break;
            }
        }
        
        if (!hasLegalMoves) {
            if (this.checkState[currentColor]) {
                this.gameState = 'checkmate';
            } else {
                this.gameState = 'stalemate';
            }
        } else if (this.checkState[currentColor]) {
            this.gameState = 'check';
        } else {
            this.gameState = 'active';
        }
    }

    wouldMoveCauseCheck(from, to, color) {
        console.log(`Checking if move from (${from.x},${from.y}) to (${to.x},${to.y}) would cause check for ${color}`);
        
        // Get the original pieces
        const originalFromPiece = this.squares[from.x][from.y];
        if (!originalFromPiece) {
            console.error(`No piece found at (${from.x},${from.y})`);
            return false;
        }
        
        const originalToPiece = this.squares[to.x][to.y];
        
        // Store original position for restoration
        const originalPosition = {x: originalFromPiece.position.x, y: originalFromPiece.position.y};
        
        // Make the move temporarily
        this.squares[from.x][from.y] = null;
        this.squares[to.x][to.y] = originalFromPiece;
        originalFromPiece.position = {x: to.x, y: to.y};

        // Get king position after the move
        let kingPosition;
        if (originalFromPiece instanceof King && originalFromPiece.color === color) {
            // If we're moving the king, use its new position
            kingPosition = {x: to.x, y: to.y};
        } else {
            // Otherwise find the king of the same color
            const king = this.pieces.find(p => 
                p instanceof King && 
                p.color === color && 
                p !== originalToPiece // Make sure we're not considering a captured king
            );
            kingPosition = king ? {x: king.position.x, y: king.position.y} : null;
        }
        
        let isInCheck = false;
        if (kingPosition) {
            // Check if the king would be under attack after the move
            const oppositeColor = color === 'white' ? 'black' : 'white';
            isInCheck = this.isPositionUnderAttack(kingPosition, oppositeColor);
            if (isInCheck) {
                console.log(`King at (${kingPosition.x},${kingPosition.y}) would be in check after move`);
            }
        }

        // Restore board state
        this.squares[from.x][from.y] = originalFromPiece;
        this.squares[to.x][to.y] = originalToPiece;
        originalFromPiece.position = {x: originalPosition.x, y: originalPosition.y};

        return isInCheck;
    }
    
    getGameStatus() {
        return {
            state: this.gameState,
            currentPlayer: this.currentPlayer,
            check: this.checkState
        };
    }

    addMoveListener(callback) {
        this.moveListeners.push(callback);
    }
}

// filepath: /home/yolrin/chess/game.js
// Update the executeMove function to handle promotions
function executeMove(from, to, promotionType = null) {
    const success = board.movePiece(from, to, promotionType);
    if (success) {
        selectedPiece = null;
        
        // If this was a pawn promotion completion, switch player turns now
        if (promotionType) {
            board.currentPlayer = board.currentPlayer === 'white' ? 'black' : 'white';
            board.updateGameState();
        }
        
        updateBoardUI();
        updateGameStatus();
    }
}