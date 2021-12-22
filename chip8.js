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
        this.keyValue = 0; // 16 bit size each bit represent pressed or not press by its key
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

        const firstBit = (opcode >> 12) & 0xF; 
        switch(firstBit){
            case 0x0:
                if(opcode & 0xFF == 0xE0 | opcode & 0xFF == 0xEE){
                    switch(opcode & 0xFF){
                        case 0xE0:
                            this.CLS();
                            break;
                        case 0xEE:
                            this.RET();
                            break;
                        default :
                            throw "opcode not found at 0x0";      
                    }
                }else this.SYS_addr(opcode);
                break;
            case 0x1:
                this.JP_addr(opcode);
                break;
            case 0x2:
                this.CALL_addr(opcode);
                break;
            case 0x3:
                this.SE_Vx_byte(opcode);
                break;
            case 0x4:
                this.SNE_Vx_byte(opcode);
                break;
            case 0x5:
                this.SE_Vx_Vy(opcode);
                break;
            case 0x6:
                this.LD_Vx_byte(opcode);
                break;
            case 0x7:
                this.ADD_Vx_byte(opcode);
                break;
            case 0x8:
                switch(opcode & 0xF){
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;
                    case 0:
                        this.LD_Vx_Vy(opcode);
                        break;                                
                }
                break;
            case 0x9:
                this.SNE_Vx_Vy(opcode);
                break;
            case 0xA:
                this.LD_I_addr(opcode);
                break;
            case 0xB:
                this.JP_V0_addr(opcode);
                break;
            case 0xC:
                this.RND_Vx_byte(opcode);
                break;   
            case 0xD:
                this.DRW_Vx_Vy_nibble(opcode);
                break;
            case 0xE:
                break; 
            case 0xF:
                break;
        }                                                                                                                                
            
    }

}

module.exports = {
    Chip8,
}