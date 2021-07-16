const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

let {matches, games, rooms,  userJoin, userRoom, userLeaves} = require('./public/js/matches');
let {Game, changeSnakeDirection, createNextGameState} = require('./public/js/game');

let ready = true;

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
server.listen(PORT, () => console.log(`Server running on PORT ${PORT}.`));

// Client connects
io.on('connection', (socket) =>{
    //let game;
    socket.on('direction changed', (keyId) =>{
        if(ready){
            ready = false;
            changeSnakeDirection(keyId, games[userRoom(socket.id)], socket.id);
        }
    });

    socket.on('joinMatch', (name) =>{
        let match = userJoin(socket.id, name);
        console.log(`${name} joined room ${match.room} with socket_id: ${socket.id}`);
        socket.join(match.room);

        if(match.full) { // room is full an the game starts
            io.sockets.to(match.room).emit('found opponent', ({usr1:match.opponent,usr2:name}));
            games[match.room].active = true;
            games[match.room].socket_to_index[socket.id] = 1;
            //startCountDown(socket.id);
            gameLoop(games[match.room], socket.id);
        }
        else{
            io.sockets.to(match.room).emit('first_in_room', true);
            games[match.room] = new Game(socket.id);
        }

    });

    socket.on('firstState', (state) => {
        matches.push(state);
    });

    socket.on('disconnect', () => {
        games[userRoom(socket.id)].active = false;
        userLeaves(socket.id);
    });
});

function gameLoop(game, socket_id){
    let room = userRoom(socket_id);
    startCountDown(room, 3).then(()=>{

        // let intervalId = setInterval(() =>{
        //     let state = createNextGameState(game);
        //     io.sockets.to(room).emit('new state', state);

        //     ready = true;
        //     if(!games[room].active) {
        //         //if(games[room].socket_to_index[socket_id] == winnerIndex){
        //         if(winnerIndex == 0){
        //             let winner_name = matches[rooms[socket_id].index].username1;
        //             //io.sockets.to(room).emit('game over', msg);
        //             io.sockets.to(room).emit('game over', winner_name);
        //         }
        //         else if(winnerIndex == 1) {
        //             let winner_name = matches[rooms[socket_id].index].username2;
        //             io.sockets.to(room).emit('game over', winner_name);
        //             //io.sockets.to(socket_id).emit('game over', msg);
        //         }
        //         //io.sockets.to(room).emit('game over', state);
        //         clearInterval(intervalId);
        //     }
        // }, 100);
    }).catch(()=>{
        let intervalId = setInterval(() =>{
            let state = createNextGameState(game);
            io.sockets.to(room).emit('new state', state);

            ready = true;
            if(!games[room].active) {
                //if(games[room].socket_to_index[socket_id] == winnerIndex){
                if(winnerIndex == 0){
                    let winner_name = matches[rooms[socket_id].index].username1;
                    //io.sockets.to(room).emit('game over', msg);
                    io.sockets.to(room).emit('game over', winner_name);
                }
                else if(winnerIndex == 1) {
                    let winner_name = matches[rooms[socket_id].index].username2;
                    io.sockets.to(room).emit('game over', winner_name);
                    //io.sockets.to(socket_id).emit('game over', msg);
                }
                //io.sockets.to(room).emit('game over', state);
                clearInterval(intervalId);
            }
        }, 100);
    });
}

// let startCountDown = new Promise((resolve, reject) => {
//     let room = userRoom(socket_id);
//     let count = 3;
//     let intervalId = setInterval(() =>{
//         if(count == 0){
//             clearInterval(intervalId);
//         }else{
//             io.sockets.to(room).emit("count down", count-1);
//             count--;
//         }
//     }, 1000);
// });

function startCountDown(room, count){
    return new Promise(function (resolve, reject) {
        let intervalId = setInterval(() =>{
            if(count == -0) reject();
            else{
                io.sockets.to(room).emit("count down", count);
                count--;
            }
        }, 1000);
    });
}

