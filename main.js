import {Chip8} from "./chip8.js";
import * as fs from 'fs';

let chip8 = new Chip8();

fs.readFile('roms/Stars.ch8', null, (err, data) => {
    chip8.loadROM(data);
})
