class bishop extends piece {
    constructor(x, y, color) {
        super(x, y, color);
        this.type = "bishop";
        this.symbol = (color === "white") ? "♗" : "♝";
    }

    
    move(x, y) {
        if (this.x == x && this.y == y) {
            return false;
        }
        if (Math.abs(this.x - x) == Math.abs(this.y - y)) {
            if (this.x < x && this.y < y) {
                for (let i = 1; i < Math.abs(this.x - x); i++) {
                    if (board[this.x + i][this.y + i] != null) {
                        return false;
                    }
                }
                return true;
            }
            if (this.x < x && this.y > y) {
                for (let i = 1; i < Math.abs(this.x - x); i++) {
                    if (board[this.x + i][this.y - i] != null) {
                        return false;
                    }
                }
                return true;
            }
            if (this.x > x && this.y < y) {
                for (let i = 1; i < Math.abs(this.x - x); i++) {
                    if (board[this.x - i][this.y + i] != null) {
                        return false;
                    }
                }
                return true;
            }
            if (this.x > x && this.y > y) {
                for (let i = 1; i < Math.abs(this.x - x); i++) {
                    if (board[this.x - i][this.y - i] != null) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
}