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


