const WIDTH = 64;
const HEIGHT = 32;
const SCREEN_BUFFER = new Array(64*32).fill(0);

class Interface{
    constructor(){

    }

    renderDisplay(screenBuffer){ 

        for(let i = 0; i < HEIGHT; i++){
            let text = ''
            for(let j = 0; j < WIDTH; j++){
                if(screenBuffer[i * WIDTH +j] == 0)
                    text += ' ';
                else text += '█';    
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

