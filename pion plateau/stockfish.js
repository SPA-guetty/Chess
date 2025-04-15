class StockfishAI {
    constructor(board, aiColor = "black", skillLevel = 10) {
        this.board = board;
        this.aiColor = aiColor;
        this.skillLevel = skillLevel;
        this.apiUrl = 'https://stockfish.online/api/s/v2.php';
        this.isThinking = false;
    }

    boardToFEN() {
        let fen = '';
        for (let x = 0; x < 8; x++) {
            let emptyCount = 0;
            for (let y = 0; y < 8; y++) {
                const piece = this.board.squares[x][y];
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    let pieceChar = this.getPieceChar(piece);
                    fen += pieceChar;
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) fen += emptyCount;
            if (x < 7) fen += '/';
        }
        fen += ' ' + (this.board.currentPlayer === 'white' ? 'w' : 'b');

        // Add castling rights
        let castling = '';
        const whiteKing  = this.board.pieces.find(p => p instanceof King && p.color === 'white');
        const blackKing = this.board.pieces.find(p => p instanceof King && p.color === 'black');
        const whiteRookKingside = this.board.squares[0][7];
        const whiteRookQueenside = this.board.squares[0][0];
        const blackRookKingside = this.board.squares[7][7];
        const blackRookQueenside = this.board.squares[7][0];

        if (whiteKing && !whiteKing.hasMoved) {
            if (whiteRookKingside instanceof Rook && !whiteRookKingside.hasMoved) castling += 'K';
            if (whiteRookQueenside instanceof Rook && !whiteRookQueenside.hasMoved) castling += 'Q';
        }
        if (blackKing && !blackKing.hasMoved) {
            if (blackRookKingside instanceof Rook && !blackRookKingside.hasMoved) castling += 'k';
            if (blackRookQueenside instanceof Rook && !blackRookQueenside.hasMoved) castling += 'q';
        }

        fen += ' ' + (castling || '-');

        // Add en passant target square
        fen += ' -';
        // Add halfmove clock and fullmove number
        fen += ' 0 1';
        return fen;
    }

    getPieceChar(piece) {
        const pieceMap = {
            'king': 'k',
            'queen': 'q',
            'rook': 'r',
            'bishop': 'b',
            'knight': 'n',
            'pawn': 'p'
        };

        let char = pieceMap[piece.type];
        return piece.color === 'white' ? char.toUpperCase() : char;
    }

    coordsToAlgebraic(coords) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return files[coords.y] + ranks[coords.x];
    }

    algebraicToCoords(algebraic) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const y = files.indexOf(algebraic[0]);
        const x = ranks.indexOf(algebraic[1]);
        return { x, y };
    }

    async makeMove() {
        if (this.board.currentPlayer !== this.aiColor || this.isThinking) return;

        this.isThinking = true;

        try {
            const fen = this.boardToFEN();
            const bestMove = await this.getBestMove(fen);

            if (bestMove) {
                const from = this.algebraicToCoords(bestMove.substring(0, 2));
                const to = this.algebraicToCoords(bestMove.substring(2, 4));

                // Check for promotion
                let promotionType = null;
                if (bestMove.length > 4) {
                    const promotionChar = bestMove[4].toLowerCase();
                    if (promotionChar === 'q') promotionType = 'queen';
                    else if (promotionChar === 'r') promotionType = 'rook';
                    else if (promotionChar === 'b') promotionType = 'bishop';
                    else if (promotionChar === 'n') promotionType = 'knight';
                }
                this.board.movePiece(from, to, promotionType);
                console.log(`AI moved: ${bestMove}`);
            }
        } catch (error) {
            console.error('Error making AI move:', error);
        }
        this.isThinking = false;
    }

    async getBestMove(fen) {
        const requestData = new URLSearchParams({
            fen: fen,
            depth: this.skillLevel,
            mode: 'bestmove',
        });

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: requestData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.bestmove) {
                return data.bestmove;
            } else {
                throw new Error('Invalid response from Stockfish API');
            }
        } catch (error) {
            console.error('Error calling Stockfish API:', error);
            throw error;
        }
    }

    setSkillLevel(level) {
        if (level >= 0 && level <= 16) {
            this.skillLevel = level;
        }
    }

    setAIColor(color) {
        this.aiColor = color;
        if (this.board.currentPlayer === this.aiColor) {
            this.makeMove();
        }
    }
}