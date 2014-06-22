'use strict';

module.exports = function(httpServer) {

  var io = require('socket.io')(httpServer);

  var PLAYER_SIZE = {width:10, height:10};
  var GAME_SPEED = 100;
  var MOVE = {NONE:'none',LEFT:'left',RIGHT:'right',UP:'up',DOWN:'down'};
  var CANVAS_SIZE = {width:210,height:210};
  // TODO Compute Canvas according to the grid
  var GRID_UNIT_SIZE = {width:10,height:10};

  var OBJECTS = {UNKNOWN: -1, NONE: 0, WALL: 1, BRICK: 2, BONUS_BOMB: 3, BONUS_FLAME: 4};


  var COLORS = [
    {name:'Gray',htmlValue:'gray'},
    {name:'Blue',htmlValue:'blue'},
    {name:'Green',htmlValue:'green'},
    {name:'Red',htmlValue:'red'},
    {name:'Yellow',htmlValue:'yellow'},
    {name:'Pink',htmlValue:'pink'}
  ];

  // TODO OPTIM: Indestructible walls could be sent only at player connexion AND/OR game start as it won't change during the game
  // This is the basic grid containing walls/bricks/bonus
  // => In the other hand we'll still have to display bonuses and destructible walls which will require x & y pos at least. We might not gain so much ...
  var grid = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,1],
    [1,0,1,2,1,0,1,0,1,0,1,0,1,0,1,0,1,2,1,0,1],
    [1,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1],
    [1,2,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,2,1],
    [1,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,2,1,2,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,2,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,2,1],
    [1,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1],
    [1,0,1,2,1,0,1,0,1,0,1,0,1,0,1,0,1,2,1,0,1],
    [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  var players = [];

  var bombs = [];

  var getNbPlayers = function() {
    return players.length;
  };

  // var centerPlayer = function(player) {

  //   player.position.x = (CANVAS_SIZE.width - PLAYER_SIZE.width) / 2;
  //   player.position.y = (CANVAS_SIZE.height - PLAYER_SIZE.height) / 2;
  // };

  var createPlayer = function(color, id) {

    var playerNumber = getNbPlayers();
    var p = {
      id: id,
      name: 'player'+(playerNumber+1),
      color: color.htmlValue,
      position: {x:10,y:10},
      verticalMove: MOVE.NONE,
      horizontalMove: MOVE.NONE,
      score: 0,
      power: 1,
      bombs: 0,
      maxBombs: 1
    };
//    centerPlayer(p);
    return p;
  };

  var createBomb = function(player) {
    bombs.push({
      pos: _getGamePos(_getGridPos(player.position)),
      life: 200,
      power: player.power,
      creator: player  // It might not be a good idea to keep a ref to the player ...
    });
  };

  var addPlayer = function(player) {

    players.push(player);
  };

  var action = function(player) {
    if (player.bombs < player.maxBombs) {
      createBomb(player);
      player.bombs++;
    }
  };

  var moveLeft = function(player) {
    player.verticalMove = MOVE.NONE;
    player.horizontalMove = MOVE.LEFT;
  };

  var moveRight = function(player) {
    player.verticalMove = MOVE.NONE;
    player.horizontalMove = MOVE.RIGHT;
  };

  var moveUp = function(player) {
    player.verticalMove = MOVE.UP;
    player.horizontalMove = MOVE.NONE;
  };

  var moveDown = function(player) {
    player.verticalMove = MOVE.DOWN;
    player.horizontalMove = MOVE.NONE;
  };

  var stopMoveLeft = function(player) {
    player.horizontalMove = MOVE.NONE;
  };

  var stopMoveRight = function(player) {
    player.horizontalMove = MOVE.NONE;
  };

  var stopMoveUp = function(player) {
    player.verticalMove = MOVE.NONE;
  };

  var stopMoveDown = function(player) {
    player.verticalMove = MOVE.NONE;
  };

  var getDrawingData = function() {

    var result = {
      canvasSize: CANVAS_SIZE,
      playerSize: PLAYER_SIZE,
      grid: grid,
      players: players,
      bombs: bombs
    };
    return result;
  };

  var _getGridObject = function(x, y) {
    if (y < grid.length) {
      if (x < grid[y].length) {
        return grid[y][x];
      }
    }
    return OBJECTS.UNKNOWN;
  };

  var _setGridObject = function(x, y, value) {
    if (y < grid.length) {
      if (x < grid[y].length) {
        grid[y][x] = value;
      }
    }
  };

  var _getGridPos = function (pos) {
    return {
      x: Math.floor((pos.x + PLAYER_SIZE.width * 0.5) / GRID_UNIT_SIZE.width),
      y: Math.floor((pos.y + PLAYER_SIZE.height * 0.5) / GRID_UNIT_SIZE.height)
    };
  };

  var _getGamePos = function (pos) {
    return {
      x: pos.x * GRID_UNIT_SIZE.width,
      y: pos.y * GRID_UNIT_SIZE.height
    };
  };

  var _processMoveDir = function(player, xDir, yDir) {
    var gridPos, gridObj, newGridPos;
    var newPosX = player.position.x + xDir;
    var newPosY = player.position.y + yDir;
    if (newPosX >= 0 && newPosY >= 0 && newPosY + PLAYER_SIZE.height <= CANVAS_SIZE.height && newPosX + PLAYER_SIZE.width <= CANVAS_SIZE.width) {
      // This will be used when bomb will have collision and we still want to be able to move on bomb if it appears under a player
      gridPos = _getGridPos(player.position);
      newGridPos = _getGridPos({x: newPosX, y: newPosY});
      gridObj = _getGridObject(newGridPos.x, newGridPos.y);
      if (gridObj === OBJECTS.BONUS_BOMB) {
        _setGridObject(newGridPos.x, newGridPos.y, OBJECTS.NONE);
        // Get another bomb
        player.maxBombs++;
        player.position.x = newPosX;
        player.position.y = newPosY;
      }
      else if (gridObj === OBJECTS.BONUS_FLAME) {
        _setGridObject(newGridPos.x, newGridPos.y, OBJECTS.NONE);
        // Flames are bigger
        player.power++;
        player.position.x = newPosX;
        player.position.y = newPosY;
      }
      else if (gridObj === OBJECTS.NONE) {
        player.position.x = newPosX;
        player.position.y = newPosY;
      }
    }
  };

  var processMove = function() {

    players.forEach(function(player) {

      // TODO FACTORIZE
      if (player.verticalMove === MOVE.UP) {
        _processMoveDir(player, 0, -1);
      } else if (player.verticalMove === MOVE.DOWN) {
        _processMoveDir(player, 0, 1);
      } else if (player.horizontalMove === MOVE.LEFT) {
        _processMoveDir(player, -1, 0);
      } else if (player.horizontalMove === MOVE.RIGHT) {
        _processMoveDir(player, 1, 0);
      }
    });
  };

  var _processBombDir = function(power, bombGridPos, xDir, yDir) {
    var pwrIdx = 1;
    var gridObj = OBJECTS.UNKNOWN;
    while (pwrIdx <= power) {
      gridObj = _getGridObject(bombGridPos.x + (xDir * pwrIdx), bombGridPos.y + (yDir * pwrIdx));
      if (gridObj === OBJECTS.NONE) {
        pwrIdx++;
      }
      else {
        break;
      }
    }
    // If the power did not reached its max => break brick/set flame RIGHT power
    if (pwrIdx <= power) {
      if (gridObj === OBJECTS.BRICK) {
        // TODO CLEAN: Sooo dirty ...
        var rnd = Math.floor(Math.random() * 3);
        if (rnd === 1) {
          gridObj = OBJECTS.BONUS_FLAME;
        }
        else if (rnd === 2) {
          gridObj = OBJECTS.BONUS_BOMB;
        }
        else {
          gridObj = OBJECTS.NONE;
        }
        _setGridObject(bombGridPos.x + (xDir * pwrIdx), bombGridPos.y + (yDir * pwrIdx), gridObj);
      }
      else if (gridObj === OBJECTS.BONUS_BOMB || gridObj === OBJECTS.BONUS_FLAME) {
        _setGridObject(bombGridPos.x + (xDir * pwrIdx), bombGridPos.y + (yDir * pwrIdx), OBJECTS.NONE);
      }
      // TODO set flame power
    }
  };

  var _processBomb = function() {
    var bombGridPos, lng = bombs.length;
    for (var i = lng-1; i >= 0; i--) {
      bombs[i].life--;
      if (bombs[i].life <= 0) {

        // Explode
        bombGridPos = _getGridPos(bombs[i].pos);

        // Process RIGHT
        _processBombDir(bombs[i].power, bombGridPos, 1, 0);
        // Process LEFT
        _processBombDir(bombs[i].power, bombGridPos, -1, 0);
        // Process TOP
        _processBombDir(bombs[i].power, bombGridPos, 0, 1);
        // Process BOTTOM
        _processBombDir(bombs[i].power, bombGridPos, 0, -1);

        // Update Bomber
        if (bombs[i].creator) {
          bombs[i].creator.bombs--;
          if (bombs[i].creator.bombs < 0) {
            console.log('ERROR: bombs < 0 for player: ' + bombs[i].creator.name);
            bombs[i].creator.bombs = 0;
          }
          bombs[i].creator = null;
        }

        // TODO: In fact the bomb should be replaced by flames that could make other bomb to explode or player if in the passage during a short period
        // Remove the Bomb
        bombs.splice(i, 1);
      }
    }
  };

  var run = function () {

    setInterval(function() {

      processMove();
      _processBomb();

      var drawingData = getDrawingData();
      io.emit('drawingData', drawingData);
    },1000/GAME_SPEED);

  };

  io.on('connection', function (socket) {

    socket.emit('myID', {id: socket.id});

    socket.on('connect-player', function(color) {

      socket.player = createPlayer(color, socket.id);
      console.log('player ' + socket.player.name + ' connected');
      addPlayer(socket.player);
    });

    socket.on('disconnect', function() {
      console.log('player ' + socket.player.name + ' disconnected');
      var pos = players.indexOf(socket.player);
      players.splice(pos,1);
    });

    socket.on('disconnect-player', function() {
      socket.disconnect();
    });

    socket.on('action', function(data) {

      console.log('action ' + data + ' ' + socket.player.name);
      action(socket.player);

    });

    socket.on('move', function(data) {

      console.log('move ' + data + ' ' + socket.player.name);
      if (data === MOVE.LEFT) {
        moveLeft(socket.player);
      } else if (data === MOVE.RIGHT) {
        moveRight(socket.player);
      } else if (data === MOVE.UP) {
        moveUp(socket.player);
      } else if (data === MOVE.DOWN) {
        moveDown(socket.player);
      }

    });

    socket.on('stopMove', function(data) {

      console.log('stopMove ' + data + ' ' + socket.player.name);
      if (data === MOVE.LEFT) {
        stopMoveLeft(socket.player);
      } else if (data === MOVE.RIGHT) {
        stopMoveRight(socket.player);
      } else if (data === MOVE.UP) {
        stopMoveUp(socket.player);
      } else if (data === MOVE.DOWN) {
        stopMoveDown(socket.player);
      }

    });

  });

  var getAvailableColors = function () {
    return COLORS;
  };

  return {
    run: run,
    getAvailableColors:getAvailableColors
  };
};

