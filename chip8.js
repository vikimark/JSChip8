const MEMORY_SIZE = 4096;

export class Chip8 {
    constructor(){
        this.memory = new Array(MEMORY_SIZE).fill(0);
        this.registers = new Array(16).fill(0);
        this.PC = 0;
        this.SP = 0;
        this.stack = new Array(16).fill(0);
    }
    loadROM(buffer){
        console.log("loading rom into memory...");
        for(let i = 0; i < buffer.length; i++){
            this.memory[0x200 + i] = buffer[i];
            
            console.log(this.memory[0x200 + i].toString(16));
        }
        console.log("loading rom successfully");
    }
}