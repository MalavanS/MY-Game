import { Player } from './player.js'
import { InputHandler } from './input.js'
import { requireLogin } from './auth.js'

// Only logged-in players can play
const session = requireLogin();

window.addEventListener('load', function () {
    if (!session) return;

    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.Player = new Player(this);
            this.input = new InputHandler();
            this.lives = session.lives;   // 2 at the start
        }
        update(){
            this.Player.update(this.input.keys);
        }
        draw(context){
            this.Player.draw(context);
        }
    }

    const game = new Game(canvas.width, canvas.height);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
});