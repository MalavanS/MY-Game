import { Player } from './player.js'
import { InputHandler } from './input.js'
import { Background } from './background.js'
import { Enemy } from './enemies.js'
import { requireLogin, updateSession } from './auth.js'

// Only logged-in players can play
const session = requireLogin();

window.addEventListener('load', function () {
    if (!session) return;

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    const WIN_SCORE = 20;   // dodge this many enemies to win

    function overlap(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x &&
               a.y < b.y + b.height && a.y + a.height > b.y;
    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.speed = 5;
            this.input = new InputHandler();
            this.player = new Player(this);
            this.background = new Background(this);
            this.enemies = [];
            this.spawnTimer = 0;
            this.spawnInterval = 1500;
            this.lives = session.lives;
            this.score = 0;
            this.invincible = 0;     // ms of protection after a hit
            this.state = 'playing';  // 'playing' | 'won' | 'lost'
            this.time = 0;
        }

        update(step, dt) {
            if (this.state !== 'playing') {
                if (this.input.keys.includes('Enter')) window.location.href = 'start.html';
                return;
            }

            this.time += dt;
            this.speed = 5 + this.score * 0.15;   // gets faster
            this.background.update(step);
            this.player.update(this.input.keys, step);
            if (this.invincible > 0) this.invincible -= dt;

            // Spawn enemies
            this.spawnTimer += dt;
            if (this.spawnTimer > this.spawnInterval) {
                this.enemies.push(new Enemy(this));
                this.spawnTimer = 0;
                this.spawnInterval = 900 + Math.random() * 1300;
            }

            for (const e of this.enemies) {
                e.update(step);

                // Hit
                if (this.invincible <= 0 && !e.dead && overlap(this.player.hitbox, e.hitbox)) {
                    e.dead = true;
                    this.lives--;
                    this.invincible = 1500;
                    updateSession({ lives: this.lives });
                    if (this.lives <= 0) this.finish('lost');
                }

                // Dodged
                if (!e.passed && !e.dead && e.x + e.width < this.player.x) {
                    e.passed = true;
                    this.score++;
                    if (this.score >= WIN_SCORE) this.finish('won');
                }
            }
            this.enemies = this.enemies.filter(e => !e.dead);
        }

        finish(result) {
            this.state = result;
            updateSession({
                lives: this.lives,
                bestScore: Math.max(session.bestScore || 0, this.score)
            });
        }

        draw(c) {
            this.background.draw(c);
            this.enemies.forEach(e => e.draw(c));

            // Blink while protected after a hit
            const blink = this.invincible > 0 && Math.floor(this.invincible / 100) % 2 === 0;
            if (!blink) this.player.draw(c);

            this.drawUI(c);
        }

        drawUI(c) {
            c.font = '24px Helvetica, Arial, sans-serif';
            c.textAlign = 'left';
            c.fillStyle = '#fff';
            c.fillText('Score: ' + this.score + ' / ' + WIN_SCORE, 20, 36);

            // Hearts (2 slots)
            c.textAlign = 'right';
            for (let i = 0; i < 2; i++) {
                c.fillStyle = i < this.lives ? '#ff5a6e' : 'rgba(255,255,255,0.25)';
                c.fillText('\u2665', this.width - 20 - i * 30, 36);
            }

            if (this.state !== 'playing') {
                c.fillStyle = 'rgba(0,0,0,0.65)';
                c.fillRect(0, 0, this.width, this.height);
                c.textAlign = 'center';
                c.fillStyle = '#f3d98b';
                c.font = '48px Helvetica, Arial, sans-serif';
                c.fillText(this.state === 'won' ? 'You escaped!' : 'Game over', this.width / 2, this.height / 2 - 20);
                c.fillStyle = '#fff';
                c.font = '22px Helvetica, Arial, sans-serif';
                c.fillText('Score: ' + this.score, this.width / 2, this.height / 2 + 20);
                c.fillText('Press Enter to go back', this.width / 2, this.height / 2 + 55);
            }
        }
    }

    const game = new Game(canvas.width, canvas.height);

    let last = 0;
    function animate(timestamp) {
        const dt = Math.min(timestamp - last, 50);   // ms, capped after tab switches
        last = timestamp;
        const step = dt / 16.67;                      // 1 at 60fps

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(step, dt);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});