import { Sitting, Running } from './playerStates.js';

export class Player{
    constructor(game){
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height;
        this.vy = 0;
        this.weight = 1;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY =0;
        this.speed = 0;
        this.maxSpeed = 10;
        this.states = [new Sitting(this), new Running(this)];
        this.currentState = this.states[0];
        this.currentState.enter();
    }
    update(input){
        this.currentState.handleInput(input);
        // Horizontal movement
        if (input.includes('ArrowRight')) this.speed = this.maxSpeed;
        else if (input.includes('ArrowLeft')) this.speed = -this.maxSpeed;
        else this.speed = 0;
        
        this.x += this.speed;
        
        // Horizontal boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // Vertical movement / Jump
        if (input.includes('ArrowUp') && this.onGround()) this.vy -= 30; // Adjust jump strength if needed
        
        this.y += this.vy;
        
        if (!this.onGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
            this.y = this.game.height - this.height; // Snap to ground
        }
    }
    draw(context){
    context.drawImage(
        this.image,
        this.frameX * this.width, this.frameY * this.height, this.width, this.height,
        this.x, this.y, this.width, this.height
    );
}

    onGround(){
        return this.y >= this.game.height - this.height;
    }

    setState(state){
        this.currentState = this.states[state];
        this.currentState.enter();
    }
}