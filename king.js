class king extends piece {
    constructor(color) {
        super(color);
        this.name = 'king';
        this.symbol = (color === 'white') ? '♔' : '♚';
    }

    move(src, dest) {
        return (src - 9 === dest ||
            src - 8 === dest ||
            src - 7 === dest ||
            src + 1 === dest ||
            src + 9 === dest ||
            src + 8 === dest ||
            src + 7 === dest ||
            src - 1 === dest);
    }
}
module.exports = king;