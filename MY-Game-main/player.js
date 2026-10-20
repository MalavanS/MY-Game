export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 60;
        this.y = this.game.height - this.height;
        this.vy = 0;
        this.weight = 0.9;
        this.jumpPower = 22;
        this.image = document.getElementById('player');
        this.speed = 0;
        this.maxSpeed = 7;
    }

    // step = 1 at 60fps, keeps speed the same on faster screens
    update(input, step = 1) {
        // Horizontal movement
        if (input.includes('ArrowRight')) this.speed = this.maxSpeed;
        else if (input.includes('ArrowLeft')) this.speed = -this.maxSpeed;
        else this.speed = 0;

        this.x += this.speed * step;
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // Jump
        if (input.includes('ArrowUp') && this.onGround()) this.vy = -this.jumpPower;

        this.y += this.vy * step;

        if (!this.onGround()) {
            this.vy += this.weight * step;
        } else {
            this.vy = 0;
            this.y = this.game.height - this.height;
        }
    }

    // Smaller than the sprite so hits feel fair
    get hitbox() {
        return {
            x: this.x + 20,
            y: this.y + 12,
            width: this.width - 40,
            height: this.height - 14
        };
    }

    draw(context) {
        const img = this.image;
        if (img && img.complete && img.naturalWidth > 0) {
            context.drawImage(img, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if player.png is missing
            context.fillStyle = '#f3a33b';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    onGround() {
        return this.y >= this.game.height - this.height;
    }
}