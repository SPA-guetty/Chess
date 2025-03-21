class pawn extends piece {
    constructor(x, y, color) {
        super(x, y, color);
        this.type = "pawn";
        this.firstMove = true;
    }

    move(x, y) {
        if (this.firstMove) {
            if (this.color === "white") {
                if (y === this.y + 2 && x === this.x) {
                    this.firstMove = false;
                    return true;
                }
            } else {
                if (y === this.y - 2 && x === this.x) {
                    this.firstMove = false;
                    return true;
                }
            }
        }
        if (this.color === "white") {
            if (y === this.y + 1 && x === this.x) {
                this.firstMove = false;
                return true;
            }
        } else {
            if (y === this.y - 1 && x === this.x) {
                this.firstMove = false;
                return true;
            }
        }
        return false;
    }

    attack(x, y) {
        if (this.color === "white") {
            if (y === this.y + 1 && (x === this.x + 1 || x === this.x - 1)) {
                this.firstMove = false;
                return true;
            }
        } else {
            if (y === this.y - 1 && (x === this.x + 1 || x === this.x - 1)) {
                this.firstMove = false;
                return true;
            }
        }
        return false;
    }
}