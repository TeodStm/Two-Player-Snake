const SNAKE1_COLOR = 'rgba(17, 230, 237,';
const SNAKE2_COLOR = 'rgba(196, 8, 61,';
const FOOD1_COLOR = 'rgba(68, 138, 189, 1)';
const FOOD2_COLOR = 'rgba(237, 97, 97, 1)';
const BG_COLOR = '#0a0a19'
const GRID_WIDTH = 50;     // 50 columns
const GRID_HEIGHT = 30;  // 30 rows

let square_size;
let game;

let game_grid = document.getElementById("game_grid");
let canvas = document.getElementById("canvas");
let ctx;
game_grid.style.width = window.innerWidth * 0.65;


function init(){
    // grid should be : (50 x square_size) x (30 x square_size)
    if (window.innerWidth / 100 < window.innerHeight / 50) square_size = Math.floor(window.innerWidth / 100);
    else square_size = Math.floor(window.innerHeight / 50);

    ctx = canvas.getContext('2d');
    canvas.width = GRID_WIDTH * square_size;
    canvas.height = GRID_HEIGHT * square_size;
    
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}


init();
//////////////////////////////
