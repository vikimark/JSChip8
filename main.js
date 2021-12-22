const FILE_PATH = 'roms/Stars.ch8'

const {Chip8} = require("./chip8.js");
const fs = require('fs');

let chip8 = new Chip8();

let data = fs.readFileSync(FILE_PATH);
chip8.loadROM(data);

function cycle(){
    let opcode = chip8._fetch(chip8.PC);
    chip8._execute(opcode);
    
    // add a delay timer

    // display
    // I/O
}
cycle();


