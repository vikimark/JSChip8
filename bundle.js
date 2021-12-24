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
    constructor(){
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

            }
        }
        // throw 'DRW_Vx_Vy_nibble not implement';
    }
    SKP_Vx(opcode){
        const numRegister = ((opcode >> 8) & 0xF);
        const value = 0b1 << this.registers[numRegister];
        if((this.keyValue & value) >> this.registers[numRegister]){
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
(function (process,setImmediate){(function (){
const FILE_PATH = 'roms/1dcell.ch8'

const KEYLAYOUT = [ 'x', '1', '2', '3',
                    'q', 'w', 'e', 'a',
                    's', 'd', 'z', 'c',
                    '4', 'r', 'f', 'v']
const {Chip8} = require("./chip8.js");
const {Interface} = require("./mockInterface.js");
const fs = require('fs');
const readLineModule = require('readline');

let tickLengthMs = 1000 / 60;
let previousTick = Date.now();

readLineModule.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let chip8 = new Chip8();
let interface = new Interface();

let data = fs.readFileSync(FILE_PATH);
chip8.loadROM(data);

function cycle(){
    let now = Date.now();
    if(previousTick + tickLengthMs <= now){
        let delta = (now - previousTick) /1000
        previousTick = now;

        console.clear();
        let opcode = chip8._fetch(chip8.PC);
        chip8._execute(opcode);
        
        // display
        interface.renderDisplay(chip8.screenBuffer);
        // delayTimer
        chip8._decreaseT();

        console.log('delta', delta, '(target: ' + tickLengthMs +' ms)');
    }

    if(Date.now() - previousTick < tickLengthMs){
        setTimeout(cycle);
    }else {
        setImmediate(cycle);
    }
    
}

// I/O
process.stdin.on('keypress', (ch, key) => {
    // keyup event
    if(KEYLAYOUT.indexOf(ch) != -1){
        let value = new Uint16Array(1);
        value[0] = 0b1 << KEYLAYOUT.indexOf(ch);
        chip8.keyValue = chip8.keyValue | value[0];
        // console.log(chip8.keyValue.toString(2).padStart(16, '0'));

        // keydown event
        setTimeout(() =>{
            chip8.keyValue = chip8.keyValue & (~value[0]);
            // console.log(chip8.keyValue.toString(2).padStart(16, '0'));
        }, 500);
    }

    if(key && key.ctrl && key.name == 'c'){
        process.exit();
    }
})
cycle();



}).call(this)}).call(this,require('_process'),require("timers").setImmediate)
},{"./chip8.js":1,"./mockInterface.js":3,"_process":5,"fs":4,"readline":4,"timers":6}],3:[function(require,module,exports){
const WIDTH = 64;
const HEIGHT = 32;
const SCREEN_BUFFER = new Array(64*32).fill(0);

class Interface{
    constructor(){

    }

    renderDisplay(screenBuffer){ 

        for(let i = 0; i < HEIGHT; i++){
            let text = ''
            for(let j = 0; j < WIDTH; j++){
                if(screenBuffer[i * WIDTH +j] == 0)
                    text += ' ';
                else text += '█';    
            }
            console.log(text);
        }
    }
}

// let interface = new Interface()
// interface.renderDisplay(SCREEN_BUFFER);

module.exports = {
    Interface,
}


},{}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":5,"timers":6}]},{},[2]);
