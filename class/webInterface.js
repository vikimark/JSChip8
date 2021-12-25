const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;

class WebInterface{
    constructor(canvas, multiplier){
        this.ctx = canvas.getContext('2d');
        this.multiplier = multiplier;
        
        this.ctx.canvas.width = SCREEN_WIDTH * this.multiplier;
        this.ctx.canvas.height = SCREEN_HEIGHT * this.multiplier;
        this.ctx.fillStyle = '#F0A500';
    }

    draw(x, y, isOn){
        if(isOn){
            this.ctx.fillRect(x * this.multiplier, y * this.multiplier, 1 * this.multiplier, 1 * this.multiplier);
        }else {
            this.ctx.clearRect(x * this.multiplier, y * this.multiplier, 1 * this.multiplier , 1 * this.multiplier);
        }
    }
    clearDisplay(){
        this.ctx.clearRect(0, 0, SCREEN_WIDTH * this.multiplier, SCREEN_HEIGHT * this.multiplier);
    }
}

module.exports = {
    WebInterface,
}