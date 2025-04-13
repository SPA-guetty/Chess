document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('chessboard');
    const statusElement = document.getElementById('game-status');
    const resetButton = document.getElementById('reset-button');
    const promotionModal = document.getElementById('promotion-modal');
    
    let board = new Board();
    let selectedPiece = null;
    let pendingPromotion = null;
    let aiPlayer = new StockfishAI(board);
    let playAgainstAI = true;
    
    // Initialize the board UI
    function initializeBoard() {
        boardElement.innerHTML = '';
        
        // Create board squares
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((x + y) % 2 === 0 ? 'white' : 'black');
                square.dataset.x = x;
                square.dataset.y = y;
                square.addEventListener('click', () => handleSquareClick(x, y));
                boardElement.appendChild(square);
            }
        }
        
        updateBoardUI();
        updateGameStatus();
    }
    
    // Update the visual representation of the board
    function updateBoardUI() {
        // Clear possible moves indicators
        document.querySelectorAll('.possible-move, .possible-capture, .selected, .check').forEach(el => {
            el.classList.remove('possible-move', 'possible-capture', 'selected', 'check');
        });
        
        // Update pieces on board
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const squareElement = document.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
                const piece = board.squares[x][y];
                
                // Clear the square content
                squareElement.textContent = '';
                
                // Add piece if present
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece', piece.color);
                    pieceElement.textContent = getPieceSymbol(piece);
                    squareElement.appendChild(pieceElement);
                    
                    // Mark king in check
                    if (piece instanceof King && board.checkState[piece.color]) {
                        squareElement.classList.add('check');
                    }
                }
            }
        }
        
        // If a piece is selected, highlight it and its possible moves
        if (selectedPiece) {
            const selectedSquare = document.querySelector(`.square[data-x="${selectedPiece.position.x}"][data-y="${selectedPiece.position.y}"]`);
            selectedSquare.classList.add('selected');
            
            // Highlight possible moves
            const legalMoves = selectedPiece.getLegalMoves();
            legalMoves.forEach(move => {
                const moveSquare = document.querySelector(`.square[data-x="${move.x}"][data-y="${move.y}"]`);
                if (board.squares[move.x][move.y]) {
                    moveSquare.classList.add('possible-capture');
                } else {
                    moveSquare.classList.add('possible-move');
                }
            });
        }
    }
    
    // Update game status display
    function updateGameStatus() {
        const status = board.getGameStatus();
        let statusText = `Current player: ${status.currentPlayer.charAt(0).toUpperCase() + status.currentPlayer.slice(1)}`;
        
        if (status.state === 'check') {
            statusText += ' (Check)';
        } else if (status.state === 'checkmate') {
            statusText = `Checkmate! ${status.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
        } else if (status.state === 'stalemate') {
            statusText = 'Stalemate! The game is a draw.';
        }
        
        statusElement.textContent = statusText;

        if (playAgainstAI && status.state === 'active' && status.currentPlayer === aiPlayer.color) {
            setTimeout(() => aiPlayer.makeMove(), 500);
        }
    }
    
    // Handle square click
    function handleSquareClick(x, y) {
        if (pendingPromotion) return; // Don't allow moves during promotion
        
        const clickedPiece = board.squares[x][y];
        
        // If no piece is selected, select one if it belongs to current player
        if (!selectedPiece) {
            if (clickedPiece && clickedPiece.color === board.currentPlayer) {
                selectedPiece = clickedPiece;
                updateBoardUI();
            }
            return;
        }
        
        // If the clicked square contains a piece of the same color, select it instead
        if (clickedPiece && clickedPiece.color === selectedPiece.color) {
            selectedPiece = clickedPiece;
            updateBoardUI();
            return;
        }
        
        // Attempt to move the selected piece
        const legalMoves = selectedPiece.getLegalMoves();
        const isLegalMove = legalMoves.some(move => move.x === x && move.y === y);
        
        if (isLegalMove) {
            // Check if this is a promotion move
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
        promotionModal.classList.remove('hidden');
        
        // Set up promotion piece click listeners
        document.querySelectorAll('.promotion-piece').forEach(piece => {
            piece.onclick = () => {
                const promotionType = piece.dataset.piece;
                executeMove(pendingPromotion.from, pendingPromotion.to, promotionType);
                hidePromotionModal();
            };
        });
    }
    
    // Hide promotion modal
    function hidePromotionModal() {
        promotionModal.classList.add('hidden');
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
        
        return symbols[piece.color][piece.type];
    }
    
    function addAIControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'ai-controls';

        const aiToggle = document.createElement('input');
        aiToggle.type = 'checkbox';
        aiToggle.id = 'ai-toggle';
        aiToggle.checked = playAgainstAI;
        aiToggle.addEventListener('change', () => {
            playAgainstAI = aiToggle.checked;
            if (playAgainstAI && board.currentPlayer === 'black') {
                aiPlayer.makeMove();
            }
        });

        const aiToggleLabel = document.createElement('label');
        aiToggleLabel.htmlFor = 'ai-toggle';
        aiToggleLabel.textContent = 'Play against AI';

        const difficultySlider = document.createElement('input');
        difficultySlider.type = 'range';
        difficultySlider.min = '1';
        difficultySlider.max = '16';
        difficultySlider.value = aiPlayer.skillLevel;
        difficultySlider.id = 'difficulty-slider';
        difficultySlider.addEventListener('change', () => {
            aiPlayer.setSkillLevel(parseInt(difficultySlider.value, 10));
        });

        const difficultyLabel = document.createElement('label');
        difficultyLabel.htmlFor = 'difficulty-slider';
        difficultyLabel.textContent = 'AI Difficulty: ';

        const difficultyValue = document.createElement('span');
        difficultyValue.id = 'difficulty-value';
        difficultyValue.textContent = aiPlayer.skillLevel;

        difficultySlider.addEventListener('input', () => {
            difficultyValue.textContent = difficultySlider.value;
        });

        // Color selection
        const colorSelect = document.createElement('select');
        colorSelect.id = 'ai-color';

        const whiteOption = document.createElement('option');
        whiteOption.value = 'black';
        whiteOption.textContent = 'Play as White';

        const blackOption = document.createElement('option');
        blackOption.value = 'white';
        blackOption.textContent = 'Play as Black';

        colorSelect.appendChild(whiteOption);
        colorSelect.appendChild(blackOption);
        colorSelect.value = aiPlayer.color;

        colorSelect.addEventListener('change', () => {
            aiPlayer.setAIColor(colorSelect.value);
        });

        controlsDiv.appendChild(aiToggleLabel);
        controlsDiv.appendChild(aiToggle);
        controlsDiv.appendChild(document.createElement('br'));
        controlsDiv.appendChild(difficultyLabel);
        controlsDiv.appendChild(difficultySlider);
        controlsDiv.appendChild(difficultyValue);
        controlsDiv.appendChild(document.createElement('br'));
        controlsDiv.appendChild(colorSelect);

        document.querySelector('.container').insertBefore(controlsDiv, boardElement);
    }

    // Reset game
    resetButton.addEventListener('click', () => {
        board = new Board();
        selectedPiece = null;
        pendingPromotion = null;
        hidePromotionModal();
        initializeBoard();
    });
    
    // Initialize the game
    initializeBoard();
    addAIControls();
});

//test