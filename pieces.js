class Pieces {
    static name = "";
    static color = "";
    static position = [];
    static isCheck = false;
    static isCheckmate = false;
    static isStalemate = false;

    constructor(name, color, position, move, isCheck, isCheckmate, isStalemate) {
        this.name = name;
        this.color = color;
        this.position = position;
        this.isCheck = isCheck;
        this.isCheckmate = isCheckmate;
        this.isStalemate = isStalemate;
    }

    static getPiece() {
        return this;
    }

    move() {
        this.position = [x, y];
    }
    
}
module.exports = Pieces;