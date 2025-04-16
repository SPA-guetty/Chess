class Bishop extends Piece {
    constructor(color, position, board) {
        super(color, position, board, 'bishop');
    }

    moveTo(newPosition) {
        super.moveTo(newPosition); // appel de la logique de mouvement de base
        this.moveSound.play('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');     // joue le son
    }

    getPossibleMoves() {
        const directions = [
            { x: 1, y: 1 }, // down right
            { x: -1, y: 1 }, // down left
            { x: 1, y: -1 }, // up right
            { x: -1, y: -1 } // up left
        ];
        return this.getStraightLineMoves(directions);
    }
}