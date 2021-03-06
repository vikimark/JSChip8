const FILE_PATH = './roms/Keypad_test.ch8'

const KEYLAYOUT = [ 'x', '1', '2', '3',
                    'q', 'w', 'e', 'a',
                    's', 'd', 'z', 'c',
                    '4', 'r', 'f', 'v']
const {Chip8} = require("./class/chip8.js");
const {WebInterface} = require("./class/webInterface.js");

let tickLengthMs = 1000 / 20;
let previousTick = Date.now();
let timer = 0;
let running = false;

var stop = false;
var frameCount = 0;
var fps = 1000;
var fpsInterval, startTime, now, then, elapsed;

const canvas = document.getElementById('canvas');
let webinterface = new WebInterface(canvas, 10);
let chip8 = new Chip8(webinterface);
document.querySelector('select').addEventListener('change', loadROM);

// alternative I/O
let keys = document.querySelectorAll(".key");
keys.forEach(key => {
    if((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) || (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document)){
        // true for mobile device
        key.onclick = function(){
            key.classList.add("click");
            const key_data = key.getAttribute("data-key");
            const keyIndex = parseInt(key_data);
            chip8.keyValue = chip8.keyValue | (0b1 << keyIndex);

            setTimeout(()=>{
                key.classList.remove("click");
                chip8.resetKeys();
            }, 100);
        }
      }else{
        // false for not mobile device
        key.onmousedown = function (){
            key.classList.add("click");
            const key_data = key.getAttribute("data-key");
            const keyIndex = parseInt(key_data);
            chip8.keyValue = chip8.keyValue | (0b1 << keyIndex);
        }
        key.onmouseup = function(){
            key.classList.remove("click");
            chip8.resetKeys();
        }
        key.onmouseleave = function(){
            key.classList.remove("click");
            chip8.resetKeys();
        }
      }
    

})

let configs = document.querySelectorAll(".config");
configs.forEach(config =>{
    if(config.getAttribute("data-key") == "1"){
        config.onmousedown = function(){
            config.classList.add("click");
            cycle();
        }
        config.onmouseup = function(){
            key.classList.remove("click");
        }
        config.onmouseleave = function(){
            key.classList.remove("click");
        }
    }
    if(config.getAttribute("data-key") == "0"){
        config.onmousedown = function(){
            config.classList.add("click");
            running = false;
            setTimeout(()=>{running = true;cycle();}, 100);
        }
        config.onmouseup = function(){
            key.classList.remove("click");
        }
        config.onmouseleave = function(){
            key.classList.remove("click");
        }
    }
})

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
    if(running){
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
    
}
function startAnimating(fps){
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    newCycle();
}

function newCycle(){
    if(running){
        timer++;
        if(timer % 5 == 0){
            chip8._decreaseT();
            timer = 0;
        }
        let opcode = chip8._fetch(chip8.PC);
        chip8._execute(opcode);
    }
    
    setTimeout(() => {
        requestAnimationFrame(newCycle);
    }, 1000/fps);
}
async function loadROM(){
    running = false;
    const rom = event.target.value;
    console.log(rom);
    const response = await fetch('./roms/' + rom);
    const arrayBuffer = await response.arrayBuffer()
    const uint8View = new Uint8Array(arrayBuffer);

    running = true;
    chip8.resetValue();
    webinterface.clearDisplay();
    console.log(uint8View);
    chip8.loadROM(uint8View);
    changeInstruction(rom);
    cycle();

}

function changeInstruction(rom){
    let text = "";
    switch(rom){
        case "breakout.ch8":
            text = "4(Q) -> go left\n6(E) -> go right";
        break;
        case "guess.ch8":
            text = "think to a number from 0 to 62\nif that number appear on the screen \npress 5(W), otherwise press other \nkeys"
        break;
        case "SpaceInvader.ch8":
            text = "5(W) -> start game\n5(W) -> shoot\n4(Q) -> go left\n6(E) -> go right";
        break;
        case "pong1.ch8":
            text = "1(1) -> go up\n4(Q) -> go down";
        break;
        case "1dcell.ch8":
            text = "It's a Wolfram cellular automata. \nThere is nothing to do with this game";
        break;
        case "snake.ch8":
            text = "5(W) -> move up\n7(A) -> move left\n8(S) -> move down\n9(D) -> move right";
            break;
        case "spacejam.ch8":
            text =  "5(W) -> move up\n7(A) -> move left\n8(S) -> move down\n9(D) -> move right";  
            break;
        case "pumpkindressup.ch8":
            text = "as the display state";
            break;     
        default:
            text = "Select your game and\nthe instruction will appear!";
            break;           
    }
    const instructionsDisplay = document.querySelector('p.instructions')
    instructionsDisplay.textContent = text;
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


