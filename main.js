const FILE_PATH = 'roms/IBM_Logo.ch8'

const KEYLAYOUT = [ '1', '2', '3', '4',
                    'q', 'w', 'e', 'r',
                    'a', 's', 'd', 'f',
                    'z', 'x', 'c', 'v']
const {Chip8} = require("./chip8.js");
const {Interface} = require("./mockInterface.js");
const fs = require('fs');
const readLineModule = require('readline');

readLineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let chip8 = new Chip8();
let interface = new Interface();

let data = fs.readFileSync(FILE_PATH);
chip8.loadROM(data);

function cycle(){
    console.clear();
    let opcode = chip8._fetch(chip8.PC);
    chip8._execute(opcode);
    
    // add a delay timer
    // console.clear();
    
    interface.renderDisplay(chip8.screenBuffer);
    // display
    // I/O
}
process.stdin.on('keypress', (ch, key) => {
    if(KEYLAYOUT.indexOf(ch) != -1){
        let value = new Uint16Array(1);
        value[0] = 0b1 << KEYLAYOUT.indexOf(ch);
        chip8.keyValue = chip8.keyValue | value[0];
        console.log(chip8.keyValue.toString(2).padStart(16, '0'));

        setTimeout(() =>{
            chip8.keyValue = chip8.keyValue & (~value[0]);
            console.log(chip8.keyValue.toString(2).padStart(16, '0'));
        }, 100);
    }

    if(key && key.ctrl && key.name == 'c'){
        process.exit();
    }
})
setInterval(cycle, 25);



