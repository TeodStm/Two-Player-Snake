const GRID_WIDTH = 50;
const GRID_HEIGHT = 30;

class Game {
    constructor(socket_id) {
      // Grid is 50 x 30 (width x height)
      this.snakes_array = [];
      this.food_array = [];
      this.active = false;
  
      let food1 = new Food(37, 14);
      let snake1 = new Snake([20,15]);
      this.score1 = 0;
      this.snake_index = 0;
      this.enemy_index = 1;
  
      let food2 = new Food(12, 14);
      let snake2 = new Snake([30,15]);
      this.score2 = 0;
  
      this.snakes_array.push(snake1);
      this.snakes_array.push(snake2);
  
      this.food_array.push(food1);
      this.food_array.push(food2);

      this.socket_to_index = {};
      this.socket_to_index[socket_id] = 0;
  
      this.start = true; ////++++++++++++++++++++
    }
  }
  
  /////************//////
  class Snake {
    constructor(start) {
      this.snake_body = [];
      this.x_speed = 0;
      this.y_speed = 1;
  
      //grid size ==> width : 50 * square_size, height: 30 * square_size
      let start_x = start[0]
      let start_y = start[1];
        
      this.snake_body.push({x: start[0], y: start[1]});
      this.snake_body.push({x: start[0], y: start[1]-1});
      this.snake_body.push({x: start[0], y: start[1]-2});

      //this.snake_body[0] = {x: start[0], y: start[1]};
      //this.snake_body[1] = {x: start[0], y: start[1] - 1};
      //this.snake_body[2] = {x: start[0], y: start[1] - 2};
      this.last_spot_x = this.snake_body[2].x;
      this.last_spot_y = this.snake_body[2].y;
    }
  }
  
  ////////////////////
  class Food {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.same_pos_with_enemy = false;
    }
  }

  function changeSnakeDirection(keyId, game, socket_id){
    let x;
    let y;
    let snake_index = game.socket_to_index[socket_id];

    if(keyId == 39 || keyId == 68){ // right arrow or 'd'
        x = 1;
        y = 0;
    }
    else if(keyId == 37 || keyId == 65){ // left arrow or 'a'
        x = -1;
        y = 0;
    }
    else if(keyId == 38 || keyId == 87){ // up arrow or 'w'
        x = 0;
        y = -1;
    }
    else if(keyId == 40 || keyId == 83){ // down arrow or 's'
        x = 0;
        y = 1;
    }
    
    if(x == 0){ //means that y is 1 or -1
        if(game.snakes_array[snake_index].y_speed == 0){
            game.snakes_array[snake_index].x_speed = x;
            game.snakes_array[snake_index].y_speed = y;
        }
    }
    else if(y == 0){ //means that x is 1 or -1
        if(game.snakes_array[snake_index].x_speed == 0){
            game.snakes_array[snake_index].x_speed = x;
            game.snakes_array[snake_index].y_speed = y;
        }
    }
}

function createNextGameState(game){
    let player1 = updateSnake(game.snakes_array[0], game.food_array[0]);
    let player2 = updateSnake(game.snakes_array[1], game.food_array[1]);

    //let crash = snakeCrash(game.snakes_array[0].snake_body, game.snakes_array[1].snake_body);
    let crash = 0;
    let winner = 0;
    if(crash == 1){ // snake1 crashed snake2
        game.active = false;
        winner = 2;
    }
    else if(crash == 2){ // snake2 crashed snake1
        game.active = false;
        winner = 1;
    }
    else if(crash == 3){ // simultaneous crash
        game.active = false;
        winner = 3;
    }
    
    if(player1.eats) game.score1 += 1;
    if(player2.eats) game.score2 += 1;

    return {
        snake1: game.snakes_array[0].snake_body,
        food1: game.food_array[0],
        score1:game.score1,
        snake2: game.snakes_array[1].snake_body,
        food2: game.food_array[1],
        score2:game.score2,
        winner
    };
}

function snakeCrash(snake1, snake2){
    // returns 0 for no crash, 1 for snake1 crashing snake2,
    //2 for snake2 crashing snake1, 3 for simultaneous crash
    let crash = 0;
    for(let i = 0; i < snake2.length; i++){
        if(snake1[0].x == snake2[i].x && snake1[0].y == snake2[i].y){
            console.log('CRASHHH');
            crash = 1;
            break;
        }
    }

    for(let i = 0; i < snake1.length; i++){
        if(snake2[0].x == snake1[i].x && snake2[0].y == snake1[i].y){
            console.log('CRASHHH');
            if(crash == 1) crash = 3; //means tie (both snakes crashed with the other)
            else crash = 2;
            break;
        }
    }
    return crash;
}

function updateSnake(snake, food){
    let last_x = snake.snake_body[snake.snake_body.length-1].x;
    let last_y = snake.snake_body[snake.snake_body.length-1].y;
    let eats = false;

    // shift cells except first one
    for(let i=snake.snake_body.length-1; i > 0; i--){
        snake.snake_body[i].x = snake.snake_body[i-1].x;
        snake.snake_body[i].y = snake.snake_body[i-1].y;
    }
    // update first cell (snake head)
    snake.snake_body[0].x += snake.x_speed;
    snake.snake_body[0].y += snake.y_speed;

    
    if(snake.snake_body[0].x < 0)
        snake.snake_body[0].x = GRID_WIDTH-1;
    if(snake.snake_body[0].x >= GRID_WIDTH)
        snake.snake_body[0].x = 0;
    if(snake.snake_body[0].y < 0)
        snake.snake_body[0].y = GRID_HEIGHT-1;
    if(snake.snake_body[0].y >= GRID_HEIGHT)
        snake.snake_body[0].y = 0;

    if(snake.snake_body[0].x == food.x && snake.snake_body[0].y == food.y ){
        // eats food
        snake.snake_body.push({x:last_x, y:last_y});
        eats = true;

        //respawn food in random position
        food.x = Math.floor(Math.random()*GRID_WIDTH);
        food.y = Math.floor(Math.random()*GRID_HEIGHT);
    }

    return {snake, food, eats};
}
  module.exports = {Game, changeSnakeDirection, createNextGameState};