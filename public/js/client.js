//const { request } = require("express");
document.addEventListener('keydown', keydown);

const socket = io();

// Get username from url
const username = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true
});

socket.on('first_in_room', displayUser);
socket.on('found opponent', displayOpponent);
socket.on('new state', drawGame);
socket.emit('joinMatch', username.username);






function displayOpponent(names){
    document.getElementById("user1").innerHTML = names.usr1;
    document.getElementById("user2").innerHTML = names.usr2;
}

function displayUser(val){
    document.getElementById("user1").innerHTML = username.username;
    document.getElementById("user2").innerHTML = "Waiting for opponent";
}


function drawGame(state){
    // state members: snake1, food1, snake2, food2
    requestAnimationFrame(() => {
        // repaint background
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0,0,GRID_WIDTH*square_size, GRID_HEIGHT*square_size);

        // draw snake1 and snake1
        for(let i=0; i < state.snake1.length; i++){
            ctx.fillStyle = SNAKE1_COLOR + (1 - i*0.02).toString()+')';
            ctx.fillRect(state.snake1[i].x*square_size, state.snake1[i].y*square_size, square_size, square_size);
        }
        
        for(let i=0; i < state.snake2.length; i++){
            ctx.fillStyle = SNAKE2_COLOR + (1 - i*0.02).toString()+')';
            ctx.fillRect(state.snake2[i].x*square_size, state.snake2[i].y*square_size, square_size, square_size);
        }

        //draw food1 and food2
        //ctx.fillStyle = 'blue';
        ctx.fillStyle = FOOD1_COLOR;
        ctx.fillRect(state.food1.x*square_size, state.food1.y*square_size, square_size, square_size);

        //ctx.fillStyle = 'red';
        ctx.fillStyle = FOOD2_COLOR;
        ctx.fillRect(state.food2.x*square_size, state.food2.y*square_size, square_size, square_size);

        document.getElementById("score1").innerHTML = state.score1.toString();
        document.getElementById("score2").innerHTML = state.score2.toString();
    });
}

function rgbToString(rgb){
    let str = 'rgb('+rgb[0].toString()+','+rgb[1].toString()+','+rgb[2].toString()+')';
    return str;
}

function keydown(e){
    socket.emit('direction changed', e.keyCode);
}