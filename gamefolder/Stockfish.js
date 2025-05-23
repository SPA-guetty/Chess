class StockfishAI {
    constructor(board, aiColor = "black", skillLevel = 5) {
        this.board = board;
        this.aiColor = aiColor;
        this.skillLevel = skillLevel;
        // Use local proxy to avoid CORS
        this.apiUrl = '/stockfish-proxy';
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
        if (this.board.currentPlayer !== this.aiColor || this.isThinking) {
            return Promise.resolve(false);
        }

        this.isThinking = true;
        console.log("AI is thinking...");

        try {
            const fen = this.boardToFEN();
            let bestMove;

            // Use a local fallback directly instead of trying external APIs with CORS issues
            try {
                // Only try the primary API if we're not on localhost
                if (!window.location.hostname.includes('localhost')) {
                    bestMove = await this.getBestMove(fen, this.skillLevel);
                    console.log("Stockfish API returned a move:", bestMove);
                } else {
                    throw new Error('Skipping external API on localhost due to CORS');
                }
            } catch (error) {
                console.warn("Using local move calculation:", error.message);
                bestMove = this.getLocalBestMove(this.skillLevel);
                console.log("Local engine chose move:", bestMove);
            }

            // Process the move
            if (bestMove) {
                let from, to, promotionType = null;

                if (typeof bestMove === 'string') {
                    // API move in algebraic notation (e.g. "e2e4")
                    from = this.algebraicToCoords(bestMove.substring(0, 2));
                    to = this.algebraicToCoords(bestMove.substring(2, 4));

                    if (bestMove.length > 4) {
                        const promotionChar = bestMove[4].toLowerCase();
                        if (promotionChar === 'q') promotionType = 'queen';
                        else if (promotionChar === 'r') promotionType = 'rook';
                        else if (promotionChar === 'b') promotionType = 'bishop';
                        else if (promotionChar === 'n') promotionType = 'knight';
                    }
                } else {
                    // Local move object
                    from = bestMove.from;
                    to = bestMove.to;
                }
                
                console.log(`AI moved: ${JSON.stringify(from)} to ${JSON.stringify(to)}`);
                const success = this.board.movePiece(from, to, promotionType);
                this.isThinking = false;
                return Promise.resolve(success);
            }
        } catch (error) {
            console.error('Error making AI move:', error);
        }

        this.isThinking = false;
        return Promise.resolve(false);
    }

    async getBestMove(fen, skillLevel) {
        const requestData = new URLSearchParams({
            fen: fen,
            depth: skillLevel,
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

            // Log the raw response text for debugging
            const responseText = await response.text();
            console.log("Raw API response:", responseText);
            
            // Try parsing as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.log("Response is not JSON, handling as text");
                
                // For text responses like "bestmove e2e4"
                if (responseText.includes("bestmove")) {
                    const match = responseText.match(/bestmove\s+(\w+)/);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
                
                throw new Error('Could not parse API response');
            }

            // Handle different response structures
            if (data.bestmove) {
                return data.bestmove;
            } else if (data.best) {
                return data.best;
            } else if (data.move) {
                return data.move;
            } else if (Array.isArray(data) && data.length > 0) {
                // In case the API returns an array with move data
                return data[0].move || data[0].bestmove || data[0];
            } else {
                console.error("Unexpected API response structure:", data);
                throw new Error('Response did not contain move data');
            }
        } catch (error) {
            console.error('Error calling Stockfish API:', error);
            throw error;
        }
    }

    async getMoveFallbackAPI(fen, skillLevel) {
        try {
            const response = await fetch(this.fallbackApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fen: fen,
                    depth: skillLevel
                })
            });

            if (!response.ok) {
                throw new Error(`Fallback API HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Adjust based on actual response format
            if (data.move) {
                return data.move;
            } else if (data.bestMove) {
                return data.bestMove;
            } else {
                throw new Error('Unexpected response from fallback API');
            }
        } catch (error) {
            console.error('Error calling fallback API:', error);
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

    getLocalBestMove(skillLevel = 5) {
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

        // Add some basic tactics based on skill level
        if (skillLevel > 3) {
            // Check for check moves (moves that put opponent's king in check)
            const checkMoves = allMoves.filter(move => {
                // Simulate the move and see if it puts opponent in check
                const opponentColor = this.aiColor === 'white' ? 'black' : 'white';
                const piecePos = {...move.piece.position};
                const originalTo = this.board.squares[move.to.x][move.to.y];
                
                // Make move temporarily
                this.board.squares[move.piece.position.x][move.piece.position.y] = null;
                this.board.squares[move.to.x][move.to.y] = move.piece;
                move.piece.position = move.to;
                
                // Check if opponent is in check
                const oppKing = this.board.pieces.find(p => p instanceof King && p.color === opponentColor);
                const putInCheck = oppKing && this.board.isPositionUnderAttack(oppKing.position, this.aiColor);
                
                // Undo move
                this.board.squares[piecePos.x][piecePos.y] = move.piece;
                this.board.squares[move.to.x][move.to.y] = originalTo;
                move.piece.position = piecePos;
                
                return putInCheck;
            });
            
            if (checkMoves.length > 0) {
                return checkMoves[Math.floor(Math.random() * checkMoves.length)];
            }
        }
        
        // Add some randomness based on skill level
        const randomFactor = 11 - skillLevel; // Higher skill = lower randomness
        if (Math.random() * 10 < randomFactor && allMoves.length > 1) {
            return allMoves[Math.floor(Math.random() * allMoves.length)];
        }
        
        // For higher skill levels, try to make better moves:
        // - Center control (move to center squares)
        // - Development (move knights and bishops early)
        // - King safety
        if (skillLevel >= 7) {
            // Prioritize center control
            const centerMoves = allMoves.filter(move => 
                (move.to.x >= 2 && move.to.x <= 5 && move.to.y >= 2 && move.to.y <= 5)
            );
            
            if (centerMoves.length > 0) {
                return centerMoves[Math.floor(Math.random() * centerMoves.length)];
            }
            
            // Prioritize development of knights and bishops
            const developmentMoves = allMoves.filter(move => 
                (move.piece instanceof Knight || move.piece instanceof Bishop)
            );
            
            if (developmentMoves.length > 0) {
                return developmentMoves[Math.floor(Math.random() * developmentMoves.length)];
            }
        }
        
        // If all else fails, just pick a random legal move
        return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
}