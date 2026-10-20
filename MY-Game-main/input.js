export class InputHandler {
    constructor(){
        this.keys = [];
        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowDown' || 
                 e.key === 'ArrowUp' || 
                 e.key === 'ArrowLeft' || 
                 e.key === 'ArrowRight' || 
                 e.key === 'Enter'
            ) && this.keys.indexOf(e.key) === -1){
                this.keys.push(e.key);
            }
            console.log(e.key, this.keys);
        });
        window.addEventListener('keyup', e => {
            if (e.key === 'ArrowDown' || 
                e.key === 'ArrowUp' || 
                e.key === 'ArrowLeft' || 
                e.key === 'ArrowRight' || 
                e.key === 'Enter'
            ){
              const i = this.keys.indexOf(e.key);
if (i > -1) this.keys.splice(i, 1);
            }
            console.log(e.key, this.keys);        
        });
    }
}