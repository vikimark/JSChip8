const FILE_PATH = 'roms/IBM_Logo.ch8'

const {Chip8} = require("./chip8.js");
const {Interface} = require("./mockInterface.js");
const fs = require('fs');

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

setInterval(cycle, 25);



