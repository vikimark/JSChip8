const FILE_PATH = 'roms/Stars.ch8'

import {Chip8} from "./chip8.js";
import * as fs from 'fs';

let chip8 = new Chip8();

fs.readFile(FILE_PATH, null, (err, data) => {
    chip8.loadROM(data);
})


