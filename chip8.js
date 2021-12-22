const MEMORY_SIZE = 4096;
const SCREEN_SIZE = 64 * 32;
const FONTS = [0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80];  // F

class Chip8 {
    constructor(){
        this.memory = new Array(MEMORY_SIZE).fill(0);
        this.registers = new Array(16).fill(0);
        this.PC = 0x200;
        this.SP = -1;
        this.stack = new Array(16).fill(0);
        
        this.loadFonts();

        this.screenBuffer = new Array(SCREEN_SIZE).fill(0);
    }
    loadROM(buffer){
        console.log("loading rom into memory...");
        for(let i = 0; i < buffer.length; i++){
            this.memory[0x200 + i] = buffer[i];
            
            // console.log(this.memory[0x200 + i].toString(16));
        }
        console.log("loading rom successfully");
    }
    loadFonts(){
        for(let i = 0; i < FONTS.length; i++){
            this.memory[0x50 + i] = FONTS[i];
        }
        console.log("loading FONTS successfully");
    }
    _fetch(PC){
        //argument : PC -> program counter pointing at present address
        //return   : opcode combining two 2 bytes in endian way(?)
        //increment PC by 2 at the end of function

        let opcode;
        opcode = (this.memory[this.PC] << 8 | this.memory[this.PC + 1]) & 0xFFFF;
        this.PC += 2;
        return opcode;
    }
    _execute(opcode){
        //argument : opcode -> number containing 4 bytes
        //firstly, decode an opcode then run the specific task
        //don't forget to increment PC if argument is required
    }

}

module.exports = {
    Chip8,
}