// Dark forest drawn with shapes (no images needed).
// Replace with your own parallax images later.
export class Background {
    constructor(game) {
        this.game = game;
        this.layers = [
            { speed: 0.15, color: '#1b3326', trees: this.makeTrees(10, 170, 260, 90), offset: 0 },
            { speed: 0.4,  color: '#12251c', trees: this.makeTrees(9, 140, 230, 80), offset: 0 },
            { speed: 0.8,  color: '#0a160f', trees: this.makeTrees(7, 110, 190, 70), offset: 0 }
        ];
        this.stars = Array.from({ length: 40 }, () => ({
            x: Math.random() * game.width,
            y: Math.random() * game.height * 0.5,
            r: Math.random() * 1.5 + 0.5
        }));
    }

    makeTrees(count, minH, maxH, baseW) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            trees.push({
                x: (i / count) * this.game.width + Math.random() * 40,
                h: minH + Math.random() * (maxH - minH),
                w: baseW + Math.random() * 30
            });
        }
        return trees;
    }

    update(step) {
        for (const layer of this.layers) {
            layer.offset = (layer.offset + layer.speed * this.game.speed * step) % this.game.width;
        }
    }

    draw(ctx) {
        const { width, height } = this.game;

        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#07101a');
        sky.addColorStop(1, '#1d3a2b');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (const s of this.stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Moon
        ctx.fillStyle = '#f3d98b';
        ctx.beginPath();
        ctx.arc(width - 110, 80, 36, 0, Math.PI * 2);
        ctx.fill();

        // Tree layers (far to near)
        for (const layer of this.layers) {
            ctx.fillStyle = layer.color;
            for (const t of layer.trees) {
                this.drawTree(ctx, t.x - layer.offset, t);
                this.drawTree(ctx, t.x - layer.offset + width, t);
            }
        }

        // Ground
        ctx.fillStyle = '#060d09';
        ctx.fillRect(0, height - 12, width, 12);
    }

    drawTree(ctx, x, t) {
        const base = this.game.height;
        ctx.beginPath();
        ctx.moveTo(x, base);
        ctx.lineTo(x + t.w / 2, base - t.h);
        ctx.lineTo(x + t.w, base);
        ctx.closePath();
        ctx.fill();
    }
}