const WIDTH = 64;
const HEIGHT = 32;
const SCREEN_BUFFER = new Array(64*32).fill(1);

class Interface{
    constructor(){

    }

    renderDisplay(screenBuffer){ 

        for(let i = 0; i < HEIGHT; i++){
            let text = ''
            for(let j = 0; j < WIDTH; j++){
                text += screenBuffer[i * WIDTH + j];
            }
            console.log(text);
        }
    }
}

// let interface = new Interface()
// interface.renderDisplay(SCREEN_BUFFER);

module.exports = {
    Interface,
}

