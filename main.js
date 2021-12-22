const FILE_PATH = 'roms/Stars.ch8'

import {Chip8} from "./chip8.js";
import * as fs from 'fs';

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


