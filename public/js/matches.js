let matches = [];
let games = {};
let rooms = {};
let room_id = 0;

function userJoin(user_id, username){
    if(matches.length == 0 || matches[matches.length-1].full){ // first match or all rooms are full
        let match = {
            room_id,
            username1: username,
            user_id1:user_id,
            username2: "",
            user_id2: "",
            full: false
        };
        matches.push(match);
        rooms[user_id] = room_id;
        room_id += 1;
        return {room:rooms[user_id], full:false, opponent: ""};
    }

    // join user to last room where is one user already
    matches[matches.length-1].username2 = username;
    matches[matches.length-1].user_id2 = user_id;
    matches[matches.length-1].full = true;
    rooms[user_id] = matches[matches.length-1].room_id;
    return {room: rooms[user_id], full: true, opponent: matches[matches.length-1].username1};
}

function userRoom(user_id){
    return rooms[user_id];
}

function userLeaves(user_id){
    //delete games[rooms[user_id]];
    delete rooms[user_id];

    for(let i = 0; i < matches.length; i++){
        if(matches[i].user_id1 == user_id){
            if(matches[i].user_id2 == ""){ //user2 has already gone
                matches.splice(i, 1);
            }
            else{
                matches[i].username1 = "";
                matches[i].user_id1 = "";
                matches[i].full = false;
            }
            break;
        }
        else if(matches[i].user_id2 == user_id){
            if(matches[i].user_id1 == ""){ //user2 has already gone
                matches.splice(i, 1);
            }
            else{
                matches[i].username2 = "";
                matches[i].user_id2 = "";
                matches[i].full = false;
            }
            break;
        }
    }
}

module.exports = {matches, games, userJoin, userRoom, userLeaves}