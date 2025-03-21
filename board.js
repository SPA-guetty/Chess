class Board {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                row.push(null);
            }
            board.push(row);
        }
        return board;
    }
}