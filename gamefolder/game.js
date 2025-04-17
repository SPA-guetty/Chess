window.onerror = function(message, source, lineno, colno, error) {
    console.error("JavaScript error:", message, "at", source, "line", lineno);
    return false;
};

window.onload = function() {
    // Hide the modal the moment the page loads (even before DOMContentLoaded)
    const promotionModal = document.getElementById('promotion-modal');
    if (promotionModal) {
        promotionModal.style.display = 'none';
        promotionModal.classList.add('hidden');
        console.log('Modal hidden in window.onload');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");
    
    const boardElement = document.getElementById('chessboard');
    console.log("Chessboard element:", boardElement);
    
    // Check if all required classes are loaded
    console.log("Board class loaded:", typeof Board !== 'undefined');
    console.log("Piece class loaded:", typeof Piece !== 'undefined');
    console.log("King class loaded:", typeof King !== 'undefined');
    console.log("Queen class loaded:", typeof Queen !== 'undefined');
    console.log("Rook class loaded:", typeof Rook !== 'undefined');
    console.log("Bishop class loaded:", typeof Bishop !== 'undefined');
    console.log("Knight class loaded:", typeof Knight !== 'undefined');
    console.log("Pawn class loaded:", typeof Pawn !== 'undefined');
    
    const statusElement = document.getElementById('game-status');
    const resetButton = document.getElementById('reset-button');
    const promotionModal = document.getElementById('promotion-modal');
    
    // Immediately hide the modal in multiple ways
    if (promotionModal) {
        // Use multiple techniques to force hide
        promotionModal.classList.add('hidden');
        promotionModal.style.display = 'none';
        promotionModal.style.visibility = 'hidden';
        promotionModal.style.opacity = '0';
        promotionModal.style.pointerEvents = 'none';
        promotionModal.style.position = 'absolute';
        promotionModal.style.top = '-9999px';
        promotionModal.style.left = '-9999px';
        console.log('Modal aggressively hidden in DOMContentLoaded');
    }

    const aiThinkingIndicator = document.createElement('div');
    aiThinkingIndicator.id = 'ai-thinking';
    aiThinkingIndicator.className = 'hidden';
    aiThinkingIndicator.innerHTML = 'AI is thinking <span class="thinking-dots">...</span>';

    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(aiThinkingIndicator);
    } else {
        console.error("Container element not found");
    }

    let board = new Board();
    let selectedPiece = null;
    let pendingPromotion = null;
    let aiPlayer = new StockfishAI(board);
    let playAgainstAI = true;

    board.addMoveListener((from, to) => {
        console.log(`Move listener triggered: (${from.x},${from.y}) to (${to.x},${to.y})`);
        updateBoardUI();
        
        // Only update status if it's not a promotion awaiting selection
        const piece = board.squares[to.x][to.y];
        if (!(piece instanceof Pawn && (to.x === 0 || to.x === 7) && !pendingPromotion)) {
            updateGameStatus();
        }
    });
    
    // Initialize the board UI
    function initializeBoard() {
        console.log("Initializing board...");
        const boardElement = document.getElementById('chessboard');
        
        // Clear existing content
        boardElement.innerHTML = '';
        
        // Create squares
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((x + y) % 2 === 0 ? 'white' : 'black');
                square.dataset.x = x;
                square.dataset.y = y;
                
                // Add click handler
                square.addEventListener('click', () => {
                    handleSquareClick(x, y);
                });
                
                boardElement.appendChild(square);
            }
        }
        
        // Add pieces based on board state
        updateBoardUI();
        console.log("Board initialized");
    }
    
    // Update the visual representation of the board
    function updateBoardUI() {
        console.log("Updating board UI");
        if (!board) return;
        
        // Clear existing piece elements
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            // Remove previous styling
            square.classList.remove('selected', 'possible-move', 'possible-capture', 'check');
            
            // Remove any existing piece
            const existingPiece = square.querySelector('.piece');
            if (existingPiece) {
                square.removeChild(existingPiece);
            }
            
            // Get position from data attributes
            const x = parseInt(square.dataset.x);
            const y = parseInt(square.dataset.y);
            
            // Add piece if one exists at this position
            const piece = board.squares[x][y];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.textContent = getPieceSymbol(piece);
                pieceElement.style.color = piece.color;
                square.appendChild(pieceElement);
                
                // Highlight king in check
                if (piece instanceof King && board.checkState[piece.color]) {
                    square.classList.add('check');
                }
            }
        });
        
        // If a piece is selected, highlight it and its possible moves
        if (selectedPiece) {
            const selectedSquare = document.querySelector(`.square[data-x="${selectedPiece.position.x}"][data-y="${selectedPiece.position.y}"]`);
            if (selectedSquare) {
                selectedSquare.classList.add('selected');
                
                // Highlight possible moves
                const legalMoves = selectedPiece.getLegalMoves();
                legalMoves.forEach(move => {
                    const moveSquare = document.querySelector(`.square[data-x="${move.x}"][data-y="${move.y}"]`);
                    if (moveSquare) {
                        if (board.squares[move.x][move.y]) {
                            moveSquare.classList.add('possible-capture');
                        } else {
                            moveSquare.classList.add('possible-move');
                        }
                    }
                });
            }
        }
    }
    
    // Update game status display
    function updateGameStatus() {
        const status = board.getGameStatus();
        let statusText = `Current player: ${status.currentPlayer.charAt(0).toUpperCase() + status.currentPlayer.slice(1)}`;

        const audio = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
        audio.play();
        
        if (status.state === 'check') {
            statusText += ' (Check)';
            console.log("DEBUG: King in check, analyzing moves");
            debugKingMoves();
        } else if (status.state === 'checkmate') {
            const winner = status.currentPlayer === 'white' ? 'Black' : 'White';
            statusText = `Checkmate! ${status.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
            showGameEndModal(`${winner} wins by checkmate!`);
        } else if (status.state === 'stalemate') {
            statusText = 'Stalemate! The game is a draw.';
            showGameEndModal('Draw by stalemate!');
        }
        
        statusElement.textContent = statusText;

        if (playAgainstAI && status.state === 'active' && status.currentPlayer === aiPlayer.aiColor) {
            const thinkingTime = parseInt(document.getElementById('ai-thinking-time').value);
            showAIThinking();
            
            setTimeout(() => {
                try {
                    aiPlayer.makeMove().then(() => {
                        hideAIThinking();
                        // Force update the board after AI move
                        updateBoardUI();
                        updateGameStatus();
                    }).catch(error => {
                        console.error("AI move failed:", error);
                        hideAIThinking();
                    });
                } catch (error) {
                    console.error("Error in AI move:", error);
                    hideAIThinking();
                }
            }, 300); // Short delay for UI responsiveness
        }
        debugMoves();
    }

    function debugMoves() {
        const currentColor = board.currentPlayer;
        console.log(`Debug: checking moves for ${currentColor}`);

        let totalMoves = 0;
        // Only loop through pieces that are actually on the board
        board.pieces.filter(piece => {
            // Make sure the piece is still on the board
            const isOnBoard = board.squares[piece.position.x][piece.position.y] === piece;
            return piece.color === currentColor && isOnBoard;
        }).forEach(piece => {
            try {
                const moves = piece.getLegalMoves();
                totalMoves += moves.length;
                console.log(`Piece: ${piece.type} at (${piece.position.x},${piece.position.y}) can move to:`, moves);
            } catch (error) {
                console.warn(`Error getting moves for ${piece.type} at (${piece.position.x},${piece.position.y})`, error);
            }
        });

        console.log(`Total legal moves: ${totalMoves}`);
        console.log(`Is in check: ${board.checkState[currentColor]}`);
        console.log(`Game state: ${board.gameState}`);
    }

    function debugKingMoves() {
        const kingColor = board.currentPlayer;
        const king = board.pieces.find(p => p instanceof King && p.color === kingColor);
        
        if (!king) {
            console.error("King not found!");
            return;
        }
        
        console.log(`King at (${king.position.x},${king.position.y})`);
        
        // Check all 8 possible directions
        const directions = [
            {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1},
            {x: 0, y: -1},                 {x: 0, y: 1},
            {x: 1, y: -1},  {x: 1, y: 0},  {x: 1, y: 1}
        ];
        
        directions.forEach(dir => {
            const targetPos = {
                x: king.position.x + dir.x,
                y: king.position.y + dir.y
            };
            
            if (!board.isPositionValid(targetPos)) {
                console.log(`Position (${targetPos.x},${targetPos.y}) is off the board`);
                return;
            }
            
            const targetPiece = board.squares[targetPos.x][targetPos.y];
            if (targetPiece && targetPiece.color === kingColor) {
                console.log(`Position (${targetPos.x},${targetPos.y}) is occupied by own piece`);
                return;
            }
            
            // Check if the position is under attack
            const isUnderAttack = board.isPositionUnderAttack(
                targetPos, 
                kingColor === 'white' ? 'black' : 'white'
            );
            
            console.log(`Position (${targetPos.x},${targetPos.y}): ${isUnderAttack ? 'Under Attack' : 'Safe'}`);
        });
    }
    
    // Handle square click
    function handleSquareClick(x, y) {
        console.log(`Clicked square at (${x}, ${y})`);
        
        if (pendingPromotion) return; // Don't allow moves during promotion
        
        const clickedPiece = board.squares[x][y];
        
        // If no piece is selected yet
        if (!selectedPiece) {
            // Only select pieces of the current player's color
            if (clickedPiece && clickedPiece.color === board.currentPlayer) {
                selectedPiece = clickedPiece;
                updateBoardUI();
            }
            return;
        }
        
        // If a piece is already selected
        
        // If clicking on another piece of the same color, select it instead
        if (clickedPiece && clickedPiece.color === selectedPiece.color) {
            selectedPiece = clickedPiece;
            updateBoardUI();
            return;
        }
        
        // Attempt to move the selected piece
        const legalMoves = selectedPiece.getLegalMoves();
        const isLegalMove = legalMoves.some(move => move.x === x && move.y === y);
        
        if (isLegalMove) {
            // Check if this is a pawn promotion
            if (selectedPiece instanceof Pawn && (x === 0 || x === 7)) {
                showPromotionOptions(selectedPiece.position, {x, y});
            } else {
                executeMove(selectedPiece.position, {x, y});
            }
        } else {
            // Deselect if clicked on an illegal move
            selectedPiece = null;
            updateBoardUI();
        }
    }
    
    // Execute a move
    function executeMove(from, to, promotionType = null) {
        const success = board.movePiece(from, to, promotionType);
        if (success) {
            selectedPiece = null;
            updateBoardUI();
            updateGameStatus();
        }
    }
    
    // Show promotion options
    function showPromotionOptions(from, to) {
        pendingPromotion = {from, to};
        if (promotionModal) {
            promotionModal.classList.remove('hidden');
            promotionModal.style.display = 'flex';  // Use flex to center the content
            
            // Set up promotion piece click listeners
            document.querySelectorAll('.promotion-piece').forEach(piece => {
                piece.onclick = () => {
                    const promotionType = piece.dataset.piece;
                    executeMove(pendingPromotion.from, pendingPromotion.to, promotionType);
                    hidePromotionModal();
                };
            });
        }
    }
    
    // Hide promotion modal
    function hidePromotionModal() {
        if (promotionModal) {
            promotionModal.classList.add('hidden');
            promotionModal.style.display = 'none';
        }
        pendingPromotion = null;
    }
    
    // Get Unicode chess symbol for a piece
    function getPieceSymbol(piece) {
        const symbols = {
            'white': {
                'pawn': '♙',
                'rook': '♖',
                'knight': '♘',
                'bishop': '♗',
                'queen': '♕',
                'king': '♔'
            },
            'black': {
                'pawn': '♟',
                'rook': '♜',
                'knight': '♞',
                'bishop': '♝',
                'queen': '♛',
                'king': '♚'
            }
        };
        return symbols[piece.color][piece.type.toLowerCase()];
    }
    
    function addAIControls() {
        const aiActiveCheckbox = document.getElementById('ai-active');
        const aiColorSelect = document.getElementById('ai-color');
        const aiDifficultySlider = document.getElementById('ai-difficulty');
        const difficultyValue = document.getElementById('difficulty-value');
        const aiThinkingTime = document.getElementById('ai-thinking-time');
        
        // Initialize with current values
        aiActiveCheckbox.checked = playAgainstAI;
        aiColorSelect.value = aiPlayer.aiColor;
        aiDifficultySlider.value = aiPlayer.skillLevel;
        difficultyValue.textContent = aiPlayer.skillLevel;
        
        // Update AI settings when changed
        aiActiveCheckbox.addEventListener('change', function() {
            playAgainstAI = this.checked;
            console.log(`Play against AI: ${playAgainstAI}`);
            
            // If AI is enabled and it's AI's turn, make a move
            if (playAgainstAI && board.currentPlayer === aiPlayer.aiColor) {
                setTimeout(() => aiPlayer.makeMove(), parseInt(aiThinkingTime.value));
            }
        });
        
        aiColorSelect.addEventListener('change', function() {
            aiPlayer.aiColor = this.value;
            console.log(`AI color: ${aiPlayer.aiColor}`);
            
            // If it's now AI's turn after changing color, make a move
            if (playAgainstAI && board.currentPlayer === aiPlayer.aiColor) {
                setTimeout(() => aiPlayer.makeMove(), parseInt(aiThinkingTime.value));
            }
        });
        
        aiDifficultySlider.addEventListener('input', function() {
            const level = parseInt(this.value);
            aiPlayer.skillLevel = level;
            difficultyValue.textContent = level;
            console.log(`AI difficulty: ${level}`);
        });
        
        aiThinkingTime.addEventListener('change', function() {
            console.log(`AI thinking time: ${this.value}ms`);
        });
    }

    function showAIThinking() {
        aiThinkingIndicator.classList.remove('hidden');
    }

    function hideAIThinking() {
        aiThinkingIndicator.classList.add('hidden');
    }

    // Reset game
    resetButton.addEventListener('click', () => {
        resetGame();
    });

    function showGameEndModal(result) {
        // First, hide any existing modal
        hideGameEndModal();
        
        // Create new modal with proper structure
        const modal = document.createElement('div');
        modal.id = 'game-end-modal';
        modal.classList.add('modal');
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2 id="end-result">${result}</h2>
                <button id="new-game-button">New Game</button>
            </div>
        `;
        
        // Append to DOM
        document.querySelector('.container').appendChild(modal);
        
        // Find the button and bind event using separate step
        const newGameButton = document.getElementById('new-game-button');
        
        // Clean up any existing event listeners
        if (newGameButton) {
            const newButton = newGameButton.cloneNode(true);
            newGameButton.parentNode.replaceChild(newButton, newGameButton);
            
            // Add the click handler
            newButton.addEventListener('click', function() {
                console.log("New game button clicked");
                hideGameEndModal();
                resetGame();
            });
        }
    }

    function hideGameEndModal() {
        const existingModal = document.getElementById('game-end-modal');
        if (existingModal) {
            // First remove event listeners to prevent memory leaks
            const newGameButton = document.getElementById('new-game-button');
            if (newGameButton) {
                const newButton = newGameButton.cloneNode(false);
                if (newGameButton.parentNode) {
                    newGameButton.parentNode.replaceChild(newButton, newGameButton);
                }
            }
            
            // Then remove the modal
            existingModal.remove();
            console.log("Game end modal removed");
        }
    }

    function resetGame() {
        console.log("Resetting game...");
        // No need to call hideGameEndModal here - it should be called before this function
        
        // Reset game state
        board = new Board();
        aiPlayer = new StockfishAI(board, 
            document.getElementById('ai-color').value, 
            parseInt(document.getElementById('ai-difficulty').value)
        );
        
        selectedPiece = null;
        pendingPromotion = null;
        
        // Make sure modal is hidden on reset
        hidePromotionModal();
        
        // Rebuild the board
        initializeBoard();
        
        // Update AI controls to match new board state
        addAIControls();
        
        // Update game status display
        updateGameStatus();
        
        // If AI should move first (when AI is white)
        if (playAgainstAI && board.currentPlayer === aiPlayer.aiColor) {
            const thinkingTime = parseInt(document.getElementById('ai-thinking-time').value);
            setTimeout(() => aiPlayer.makeMove(), thinkingTime);
        }
        
        console.log("Game reset complete");
    }
    
    // Make sure pendingPromotion is null on startup
    pendingPromotion = null;
    
    // Hide the promotion modal at startup
    hidePromotionModal();
    hideGameEndModal();
    
    // Initialize the game
    try {
        initializeBoard();
        addAIControls();
        
        // Add reset button functionality
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', resetGame);
        }
        
        // Update game status
        updateGameStatus();
    } catch (error) {
        console.error("Error initializing chess game:", error);
    } finally {
        // Always hide the modal, even if other code fails
        if (promotionModal) {
            promotionModal.classList.add('hidden');
            promotionModal.style.display = 'none';
            console.log('Modal hidden in finally block');
        }
    }
});