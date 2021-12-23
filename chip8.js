const { stripTags } = require("blessed");

const MEMORY_SIZE = 4096;
const SCREEN_SIZE = 64 * 32;
const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;
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
        this.I = 0;
        this.timer = 0;
        this.sound = 0;
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
        console.log(opcode.toString(16).toUpperCase());
        return opcode;
    }
    _execute(opcode){
        //argument : opcode -> number containing 4 bytes
        //firstly, decode an opcode then run the specific task
        //don't forget to increment PC if argument is required

        const firstBit = (opcode >> 12) & 0xF;
        switch(firstBit){
            case 0x0:
                switch(opcode & 0xFF){
                    case 0xE0:
                        console.log('CLS');
                        this.CLS();
                        break;
                    case 0xEE:
                        this.RET();
                        break;
                    default :
                        this.SYS_addr(opcode);
                        // throw "opcode not found at 0x0";
                        break;
                }
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
                    case 0x1:
                        this.OR_Vx_Vy(opcode);
                        break;
                    case 0x2:
                        this.AND_Vx_Vy(opcode);
                        break;
                    case 0x3:
                        this.XOR_Vx_Vy(opcode);
                        break;
                    case 0x4:
                        this.ADD_Vx_Vy(opcode);
                        break;
                    case 0x5:
                        this.SUB_Vx_Vy(opcode);
                        break;
                    case 0x6:
                        this.SHR_Vx_Vy(opcode);
                        break;
                    case 0x7:
                        this.SUBN_Vx_Vy(opcode);
                        break;
                    case 0xE:
                        this.SHL_Vx_Vy(opcode);
                        break;
                    default:
                        throw "opcode not found at 0x8"                                    
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
                switch(opcode & 0xFF){
                    case 0x9E:
                        this.SKP_Vx(opcode);
                        break;
                    case 0xA1:
                        this.SKNP_Vx(opcode);
                        break;
                    default:
                        throw "opcode not found at 0xE"        
                }
                break; 
            case 0xF:
                switch(opcode & 0xFF){
                    case 0x07:
                        this.LD_Vx_DT(opcode);
                        break;
                    case 0x0A:
                        this.LD_Vx_K(opcode);
                        break;
                    case 0x15:
                        this.LD_DT_Vx(opcode);
                        break;
                    case 0x18:
                        this.LD_ST_Vx(opcode);
                        break;
                    case 0x1E:
                        this.ADD_I_Vx(opcode);
                        break;
                    case 0x29:
                        this.LD_F_Vx(opcode);
                        break;
                    case 0x33:
                        this.LD_B_Vx(opcode);
                        break;
                    case 0x55:
                        this.LD_I_Vx(opcode);
                        break;
                    case 0x65:
                        this.LD_Vx_I(opcode);
                        break;
                    default:
                        throw "opcode not found at 0xF"                                    
                }
                break;
            default:
                throw "failed to find opcode";    
        }                                                                                                                                
        this._debuggerDisplay();
    }

    CLS(){
        this.screenBuffer.fill(0);
        // this is CLS for mockup UI;

        // has to implement CLS for terminal
    }
    RET(){
        this.PC  = this.stack[SP];
        this.SP -= 1;
        // throw 'RET not implement';
    }
    SYS_addr(opcode){
        throw 'SYS_addr not implement';
    }
    JP_addr(opcode){
        this.PC = opcode & 0xFFF;
        // throw 'JP_addr not implement';
    }
    CALL_addr(opcode){
        this.SP += 1;
        this.stack[SP] = this.PC;
        this.PC = (opcode & 0xFFF);
        // throw 'CALL_addr not implement';
    }
    SE_Vx_byte(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        if(this.registers[numRegister] == (opcode & 0xFF)){
            this.PC += 2;
        }
        // throw 'SE_Vx_byte not implement';
    }
    SNE_Vx_byte(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        if(this.registers[numRegister] != (opcode & 0xFF)){
            this.PC += 2;
        }
        // throw 'SNE_Vx_byte not implement';
    }
    SE_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        if(this.registers[numRegisterX] == this.registers[numRegisterY]){
            this.PC += 2;
        }
        // throw 'SE_Vx_Vy not implement';
    }
    LD_Vx_byte(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.registers[numRegister] = (opcode & 0xFF); 
        // throw 'LD_Vx_byte not implement';
    }
    ADD_Vx_byte(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.registers[numRegister] = this.registers[numRegister] + (opcode & 0xFF);
        // throw 'ADD_Vx_byte not implement';
    }
    LD_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        this.registers[numRegisterX] = this.registers[numRegisterY];
        // throw 'LD_Vx_Vy not implement';
    }
    OR_Vx_Vy(opcode){
        
        throw 'OR_Vx_Vy not implement';
    }
    AND_Vx_Vy(opcode){
        
        throw 'AND_Vx_Vy not implement';
    }
    XOR_Vx_Vy(opcode){
        throw 'XOR_Vx_Vy not implement';
    }
    ADD_Vx_Vy(opcode){
        throw 'ADD_Vx_Vy not implement';
    }
    SUB_Vx_Vy(opcode){
        throw 'SUB_Vx_Vy not implement';
    }
    SHR_Vx_Vy(opcode){
        throw 'SHR_Vx_Vy not implement';
    }
    SUBN_Vx_Vy(opcode){
        throw 'SUBN_Vx_Vy not implement';
    }
    SHL_Vx_Vy(opcode){
        throw 'SHL_Vx_Vy not implement';
    }
    SNE_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        if(this.registers[numRegisterX] != this.registers[numRegisterY]){
            this.PC += 2;
        }
        // throw 'SNE_Vx_Vy not implement';
    }
    LD_I_addr(opcode){
        this.I = (opcode & 0xFFF);
        // throw 'LD_I_addr not implement';
    }
    JP_V0_addr(opcode){
        const location = (opcode & 0xFFF) + this.registers[0];
        this.PC = location;
        // throw 'JP_V0_addr not implement';
    }
    RND_Vx_byte(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        let ranN = Math.floor(Math.random() * 256);
        this.registers[numRegister] = ranN & (opcode & 0xFF);
        // throw 'RND_Vx_byte not implement';
    }
    DRW_Vx_Vy_nibble(opcode){
        this.registers[0xF] = 0;
        const n_byte = (opcode & 0xF);
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        const Vx = this.registers[numRegisterX];
        const Vy = this.registers[numRegisterY];
        for(let i = 0; i < n_byte; i++){
            const byte_to_draw = this.memory[this.I + i];
            const coorY = (Vy + i) % SCREEN_HEIGHT;
            for(let row = 0; row < 8; row++){
                const bit = ((byte_to_draw >> (7 - row)) & 1)
                const coorX = (Vx + row) % SCREEN_WIDTH;
                if(bit == 1 && this.screenBuffer[coorY * SCREEN_WIDTH + coorX] == 1){                    
                    this.registers[0xF] = 1;
                }
                this.screenBuffer[coorY * SCREEN_WIDTH + coorX] = (this.screenBuffer[coorY * SCREEN_WIDTH + coorX] ^ bit) & 1; 

            }
        }
        // throw 'DRW_Vx_Vy_nibble not implement';
    }
    SKP_Vx(opcode){
        throw 'SKP_Vx not implement';
    }
    SKNP_Vx(opcode){
        throw 'SKNP not implement';
    }
    LD_Vx_DT(opcode){
        throw 'LD_Vx_DT not implement';
    }
    LD_Vx_K(opcode){
        throw 'LD_Vx_k not implement';
    }
    LD_DT_Vx(opcode){
        throw 'LD_DT_Vx not implement';
    }
    LD_ST_Vx(opcode){
        throw 'LD_ST_Vx not implement';
    }
    ADD_I_Vx(opcode){
        throw 'ADD_I_Vx not implement';
    }
    LD_F_Vx(opcode){
        throw 'LD_F_Vx not implement';
    }
    LD_B_Vx(opcode){
        throw 'LD_B_Vx not implement';
    }
    LD_I_Vx(opcode){
        throw 'LD_I_Vx not implement';
    }
    LD_Vx_I(opcode){
        throw 'LD_Vx_I not implement';
    }
    _debuggerDisplay(){
        let text =  "PC : " + this.PC.toString(16).toUpperCase() + "," +
                " SP : " + this.SP.toString(16).toUpperCase() + "," +
                " I : " + this.I.toString(16).toUpperCase() + ",";
        for(let i = 0; i < 16; i++){
            text += " V" + i + " : " + this.registers[i].toString(16).toUpperCase() + ",";
        }
        console.log(text);        
    }

}

module.exports = {
    Chip8,
}
// hello world, may god blees you