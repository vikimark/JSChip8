import {Chip8} from "./chip8.js";

let chip8 = new Chip8();

// can't pass through require('fs')
const fs = require('fs')
fs.readFile('roms/Stars.ch8', 'utf8', (err, data) => {
    if(err){
        console.error(err);
        return;
    }
    buffer = data;
})
chip8.loadROM(buffer);