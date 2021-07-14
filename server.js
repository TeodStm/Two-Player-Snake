const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

let {matches, games, userJoin, userRoom, userLeaves} = require('./public/js/matches');
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
        console.log(`${name} joined room ${match.room}`);
        socket.join(match.room);

        if(match.full) {
            io.sockets.to(match.room).emit('found opponent', ({usr1:match.opponent,usr2:name}));
            games[match.room].active = true;
            games[match.room].socket_to_index[socket.id] = 1;
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
    //console.log("game");
    let room = userRoom(socket_id);
    let intervalId = setInterval(() =>{
        //if(!games[room].active) clearInterval(intervalId);
        let state = createNextGameState(game);
        io.sockets.to(room).emit('new state', state);
        ready = true;
        if(!games[room].active) clearInterval(intervalId);
    }, 100);
}

