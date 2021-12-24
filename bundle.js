(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    constructor(webInterface){
        this.memory = new Uint8Array(MEMORY_SIZE).fill(0);
        this.registers = new Uint8Array(16).fill(0);
        this.I = 0;
        this.DT = 0;
        this.ST = 0;
        this.PC = 0x200;
        this.SP = -1;
        this.stack = new Uint16Array(16).fill(0);
        
        this.loadFonts();

        this.screenBuffer = new Array(SCREEN_SIZE).fill(0);
        this.keyValue = 0; // 16 bit size each bit represent pressed or not press by its key
        this.webInterface = webInterface;
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
    resetKeys(){
        this.keyValue = 0;
    }
    _fetch(PC){
        //argument : PC -> program counter pointing at present address
        //return   : opcode combining two 2 bytes in endian way(?)
        //increment PC by 2 at the end of function

        let opcode;
        opcode = (this.memory[this.PC] << 8 | this.memory[this.PC + 1]) & 0xFFFF;
        this.PC += 2;
        // debugger
        // console.log(opcode.toString(16).toUpperCase().padStart(4, '0'));
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
        // debugger
        // this._debuggerDisplay();
    }
    _decreaseT(){
        if(this.DT > 0){
            this.DT -= 1;
        }
        if(this.ST > 0){
            this.ST -= 1;

            // implemmet beep sound when ST decrement to zero (if possible)
        }
    }

    CLS(){
        this.screenBuffer.fill(0);
        // this is CLS for mockup UI;

        this.webInterface.clearDisplay();
        // has to implement CLS for terminal
    }
    RET(){
        this.PC  = this.stack[this.SP];
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
        this.stack[this.SP] = this.PC;
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
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        this.registers[numRegisterX] = this.registers[numRegisterX] | this.registers[numRegisterY];
        // throw 'OR_Vx_Vy not implement';
    }
    AND_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        this.registers[numRegisterX] = this.registers[numRegisterX] & this.registers[numRegisterY];
        // throw 'AND_Vx_Vy not implement';
    }
    XOR_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        this.registers[numRegisterX] = this.registers[numRegisterX] ^ this.registers[numRegisterY];
        // throw 'XOR_Vx_Vy not implement';
    }
    ADD_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        const value = this.registers[numRegisterX] + this.registers[numRegisterY];
        if((value >> 8) & 1){
            this.registers[0xF] = 1;
        }else this.registers[0xF] = 0;
        this.registers[numRegisterX] = value & 0xFFFF;
        // throw 'ADD_Vx_Vy not implement';
    }
    SUB_Vx_Vy(opcode){
        // what if the value is negative?
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        let value = new Uint8Array(1);
        value[0] = this.registers[numRegisterX] - this.registers[numRegisterY];
        if(this.registers[numRegisterX] > this.registers[numRegisterY]){
            this.registers[0xF] = 1;
        }else this.registers[0xF] = 0;
        this.registers[numRegisterX] = value[0];
        // throw 'SUB_Vx_Vy not implement';
    }
    SHR_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        if((this.registers[numRegisterX] & 1)){
            this.registers[0xF] = 1;
        }else this.registers[0xF] = 0;
        this.registers[numRegisterX] >>= 1;
        // throw 'SHR_Vx_Vy not implement';
    }
    SUBN_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        let value = new Uint8Array(1);
        value[0] = this.registers[numRegisterY] - this.registers[numRegisterX];
        if(this.registers[numRegisterY] > this.registers[numRegisterX]){
            this.registers[0xF] = 1;
        }else this.registers[0xF] = 0;
        this.registers[numRegisterX] = value[0];
        // throw 'SUBN_Vx_Vy not implement';
    }
    SHL_Vx_Vy(opcode){
        const numRegisterX = ((opcode >> 8) & 0xF);
        const numRegisterY = ((opcode >> 4) & 0xF);
        if(((this.registers[numRegisterX] >> 7)& 1)){
            this.registers[0xF] = 1;
        }else this.registers[0xF] = 0;
        this.registers[numRegisterX] <<= 1;
        // throw 'SHL_Vx_Vy not implement';
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
                this.webInterface.draw(coorX, coorY, this.screenBuffer[coorY * SCREEN_WIDTH + coorX]);

            }
        }
        // throw 'DRW_Vx_Vy_nibble not implement';
    }
    SKP_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        const value = 0b1 << this.registers[numRegister];
        let logit = (this.keyValue & value) >> this.registers[numRegister];
        if(logit){
            this.PC += 2;
        }
        // throw 'SKP_Vx not implement';
    }
    SKNP_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        const value = 0b1 << this.registers[numRegister];
        if(!(this.keyValue & value) >> this.registers[numRegister]){
            this.PC += 2;
        }
        // throw 'SKNP not implement';
    }
    LD_Vx_DT(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.registers[numRegister] = this.DT;
        // throw 'LD_Vx_DT not implement';
    }
    LD_Vx_K(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        if(this.keyValue > 0){
            // assumed that one key is pressed at a time
            let count = 0;
            let temp = this.keyValue;
            while(temp > 0b1){
                count++;
                temp >>= 1;
            }
            this.registers[numRegister] = count;
        }else this.PC -= 2;
        // throw 'LD_Vx_k not implement';
    }
    LD_DT_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.DT = this.registers[numRegister];
        // throw 'LD_DT_Vx not implement';
    }
    LD_ST_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.ST = this.registers[numRegister];
        // throw 'LD_ST_Vx not implement';
    }
    ADD_I_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.I += this.registers[numRegister];
        // throw 'ADD_I_Vx not implement';
    }
    LD_F_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        this.I = 0x50 + this.registers[numRegister] * 5;
        // throw 'LD_F_Vx not implement';
    }
    LD_B_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        let value = this.registers[numRegister];
        for(let i = 2; i >= 0; i--){
            this.memory[this.I + i] = value % 10; 
            value = Math.floor(value/10);
        }
        // throw 'LD_B_Vx not implement';
    }
    LD_I_Vx(opcode){
        const numRegister = (opcode >> 8) & 0xF;
        for(let i = 0; i < numRegister + 1; i++){
            this.memory[this.I + i] = this.registers[i]
        }
        // throw 'LD_I_Vx not implement';
    }
    LD_Vx_I(opcode){
        const numRegister = (opcode >> 8) & 0xF;
        for(let i = 0; i < numRegister + 1; i++){
            this.registers[i] = this.memory[this.I + i];
        }
        // throw 'LD_Vx_I not implement';
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
},{}],2:[function(require,module,exports){
const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 32;

class WebInterface{
    constructor(canvas, multiplier){
        this.ctx = canvas.getContext('2d');
        this.multiplier = multiplier;
        
        this.ctx.canvas.width = SCREEN_WIDTH * this.multiplier;
        this.ctx.canvas.height = SCREEN_HEIGHT * this.multiplier;
        this.ctx.fillStyle = 'orange';
    }

    draw(x, y, isOn){
        if(isOn){
            this.ctx.fillRect(x * this.multiplier, y * this.multiplier, 1 * this.multiplier, 1 * this.multiplier);
        }else {
            this.ctx.clearRect(x * this.multiplier, y * this.multiplier, 1 * this.multiplier , 1 * this.multiplier);
        }
    }
    clearDisplay(){
        this.ctx.clearRect(0, 0, SCREEN_WIDTH * this.multiplier, SCREEN_HEIGHT * this.multiplier);
    }
}

module.exports = {
    WebInterface,
}
},{}],3:[function(require,module,exports){
const FILE_PATH = './roms/SpaceInvader.ch8'

const KEYLAYOUT = [ 'x', '1', '2', '3',
                    'q', 'w', 'e', 'a',
                    's', 'd', 'z', 'c',
                    '4', 'r', 'f', 'v']
const {Chip8} = require("./class/chip8.js");
const {WebInterface} = require("./class/webInterface.js");

let tickLengthMs = 1000 / 60;
let previousTick = Date.now();
let timer = 0;

const canvas = document.getElementById('canvas');
let webinterface = new WebInterface(canvas, 10);
let chip8 = new Chip8(webinterface);
loadROM(FILE_PATH);

// implement new read I/0
// keyup event
document.addEventListener('keydown', event => {
    const keyIndex = KEYLAYOUT.indexOf(event.key);

    if(keyIndex != -1){
        let value = new Uint16Array(1);
        value[0] = 0b1 << keyIndex;
        chip8.keyValue = chip8.keyValue | value[0];
    }
});
// keydown event
document.addEventListener('keyup', event => {
    chip8.resetKeys();
})

// implement new readfile func

function cycle(){
    timer++;
    if(timer % 5 == 0){
        chip8._decreaseT();
        timer = 0;
    }
    let opcode = chip8._fetch(chip8.PC);
    chip8._execute(opcode);

    // display is combined with chip8 class
    // delayTimer

    setTimeout(cycle, 3);
    
}

async function loadROM(file_path){
    const response = await fetch(file_path);
    const arrayBuffer = await response.arrayBuffer()
    const uint8View = new Uint8Array(arrayBuffer);

    webinterface.clearDisplay();
    console.log(uint8View);
    chip8.loadROM(uint8View);

    cycle();
}



// I/O
// process.stdin.on('keypress', (ch, key) => {
//     // keyup event
//     if(KEYLAYOUT.indexOf(ch) != -1){
//         let value = new Uint16Array(1);
//         value[0] = 0b1 << KEYLAYOUT.indexOf(ch);
//         chip8.keyValue = chip8.keyValue | value[0];
//         // console.log(chip8.keyValue.toString(2).padStart(16, '0'));

//         // keydown event
//         setTimeout(() =>{
//             chip8.keyValue = chip8.keyValue & (~value[0]);
//             // console.log(chip8.keyValue.toString(2).padStart(16, '0'));
//         }, 500);
//     }

//     if(key && key.ctrl && key.name == 'c'){
//         process.exit();
//     }
// })



},{"./class/chip8.js":1,"./class/webInterface.js":2}]},{},[3]);
