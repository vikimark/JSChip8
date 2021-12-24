const FILE_PATH = 'roms/1dcell.ch8'

const KEYLAYOUT = [ 'x', '1', '2', '3',
                    'q', 'w', 'e', 'a',
                    's', 'd', 'z', 'c',
                    '4', 'r', 'f', 'v']
const {Chip8} = require("./chip8.js");
const {Interface} = require("./mockInterface.js");
const fs = require('fs');
const readLineModule = require('readline');

let tickLengthMs = 1000 / 60;
let previousTick = Date.now();

readLineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let chip8 = new Chip8();
let interface = new Interface();

let data = fs.readFileSync(FILE_PATH);
chip8.loadROM(data);

function cycle(){
    let now = Date.now();
    if(previousTick + tickLengthMs <= now){
        let delta = (now - previousTick) /1000
        previousTick = now;

        console.clear();
        let opcode = chip8._fetch(chip8.PC);
        chip8._execute(opcode);
        
        // display
        interface.renderDisplay(chip8.screenBuffer);
        // delayTimer
        chip8._decreaseT();

        console.log('delta', delta, '(target: ' + tickLengthMs +' ms)');
    }

    if(Date.now() - previousTick < tickLengthMs){
        setTimeout(cycle);
    }else {
        setImmediate(cycle);
    }
    
}

// I/O
process.stdin.on('keypress', (ch, key) => {
    // keyup event
    if(KEYLAYOUT.indexOf(ch) != -1){
        let value = new Uint16Array(1);
        value[0] = 0b1 << KEYLAYOUT.indexOf(ch);
        chip8.keyValue = chip8.keyValue | value[0];
        // console.log(chip8.keyValue.toString(2).padStart(16, '0'));

        // keydown event
        setTimeout(() =>{
            chip8.keyValue = chip8.keyValue & (~value[0]);
            // console.log(chip8.keyValue.toString(2).padStart(16, '0'));
        }, 500);
    }

    if(key && key.ctrl && key.name == 'c'){
        process.exit();
    }
})
cycle();


