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
        console.log("AI is thinking...");

        try {
            const fen = this.boardToFEN();
            console.log("Generated FEN:", fen);
            
            const bestMove = await this.getBestMove(fen).catch(error => {
                console.warn("API failed, using local move fallback:", error);
                return this.getLocalBestMove();
            });

            if (bestMove) {
                // Check if bestMove is a string (from API) or an object (from local fallback)
                if (typeof bestMove === 'string') {
                    // Handle API response (e.g. "e2e4")
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
                    
                    console.log(`AI moved: ${bestMove}`);
                    this.board.movePiece(from, to, promotionType);
                } else {
                    // Handle local fallback move (object with from/to properties)
                    console.log(`AI moved: ${JSON.stringify(bestMove.from)} to ${JSON.stringify(bestMove.to)}`);
                    this.board.movePiece(bestMove.from, bestMove.to);
                }
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

    getLocalBestMove() {
        const aiPieces = this.board.pieces.filter(piece => piece.color === this.aiColor);
        let allMoves = [];
        for (const piece of aiPieces) {
            const pieceMoves = piece.getLegalMoves();
            for (const move of pieceMoves) {
                allMoves.push({
                    from: piece.position,
                    to: move,
                    piece: piece,
                });
            }
        }

        if (allMoves.length === 0) return null; // No moves available

        // Choose a semi-random move

        // check for captures
        const captures = allMoves.filter(move =>
            this.board.squares[move.to.x][move.to.y] !== null
        );

        if (captures.length > 0) {
            captures.sort((a, b) => {
                const pieceValues = {
                    'pawn': 1,
                    'knight': 3,
                    'bishop': 3,
                    'rook': 5,
                    'queen': 9,
                    'king': 100
                };

                const aValue = this.board.squares[a.to.x][a.to.y] ?
                    pieceValues[this.board.squares[a.to.x][a.to.y].type] : 0;
                const bValue = this.board.squares[b.to.x][b.to.y] ?
                    pieceValues[this.board.squares[b.to.x][b.to.y].type] : 0;
                return bValue - aValue;
            });

            return captures[0];
        }

        // Check for promotions
        const promotions = allMoves.filter(move => 
            move.piece instanceof Pawn && (move.to.x === 0 || move.to.x === 7)
        );
        if (promotions.length > 0) {
            return promotions[0];
        }

        // If no captures or promotions, return a random move
        const randomIndex = Math.floor(Math.random() * allMoves.length);
        return allMoves[randomIndex];
    }
}