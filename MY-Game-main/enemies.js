// Ground enemies that run in from the right. Drawn with shapes for now.
export class Enemy {
    constructor(game) {
        this.game = game;
        const tall = Math.random() < 0.35;
        this.width = tall ? 50 : 65;
        this.height = tall ? 95 : 55;
        this.x = game.width;
        this.y = game.height - this.height;
        this.speedBonus = Math.random() * 2;
        this.passed = false;   // true once the player jumped/dodged past it
        this.dead = false;
    }

    update(step) {
        this.x -= (this.game.speed + this.speedBonus) * step;
        if (this.x + this.width < 0) this.dead = true;
    }

    get hitbox() {
        return { x: this.x + 6, y: this.y + 6, width: this.width - 12, height: this.height - 6 };
    }

    draw(ctx) {
        const { x, y, width: w, height: h } = this;

        // Body
        ctx.fillStyle = '#5a1f2b';
        ctx.beginPath();
        ctx.roundRect(x, y + 10, w, h - 10, 10);
        ctx.fill();

        // Spikes
        ctx.fillStyle = '#8c2f3f';
        const spikes = 4;
        for (let i = 0; i < spikes; i++) {
            const sx = x + (i / spikes) * w;
            ctx.beginPath();
            ctx.moveTo(sx, y + 12);
            ctx.lineTo(sx + w / spikes / 2, y - 2);
            ctx.lineTo(sx + w / spikes, y + 12);
            ctx.closePath();
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#f3d98b';
        ctx.beginPath();
        ctx.arc(x + w * 0.3, y + h * 0.35, 5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.7, y + h * 0.35, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}