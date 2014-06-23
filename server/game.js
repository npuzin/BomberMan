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

  var bombGrid = [];
  /**
   * Create an empty grid for bombs the same size of the grid
   */
  var _createBombGrid = function() {
    if (grid.length > 0) {
      var lng = bombGrid.length = grid.length;
      for (var i = 0; i < lng; i++) {
        bombGrid[i] = [];
        bombGrid[i].length = grid[0].length;  // Use th first Line length for every line
      }
    }
    else {
      bombGrid.length = 0;
    }
  };
  /*var _clearBombGrid = function() {
    var x, y, lngX, lngY = bombGrid.length;
    for (y = 0; y < lngY; y++) {
      lngX = bombGrid[y].length;
      for (x = 0; x < lngX; x++) {
        bombGrid[y][x] = null;
      }
    }
  };*/
  _createBombGrid();

  var players = [];

  var bombs = [];
  var explodingBombs = [];

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
    var gridPos = _getGridPos(player.position);

    // Create the bomb
    var bomb = {
      pos: _getGamePos(gridPos),
      gridPos: gridPos,
      life: 200,
      power: player.power,
      creator: player  // It might not be a good idea to keep a ref to the player ...
    };

    console.log('bombX: ' + bomb.gridPos.x);
    console.log('bombY: ' + bomb.gridPos.y);
    bombs.push(bomb);
    // Add bomb to the grid bomb
    bombGrid[gridPos.y][gridPos.x] = bomb;
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

  var _addToExplodingBombList = function(bomb) {
    var idx = bombs.indexOf(bomb);
    // If the bomb is not already in the exploding list => remove from the bomb list & adds to the exploding list
    if (idx >= 0) {
      bombs.splice(idx, 1);
      explodingBombs.push(bomb);
    }
  };

  var _processBombDir = function(power, bombGridPos, xDir, yDir) {
    var bomb, gridPosX, gridPosY;
    var pwrIdx = 1;
    var gridObj = OBJECTS.UNKNOWN;

    while (pwrIdx <= power) {
      gridPosX = bombGridPos.x + (xDir * pwrIdx);
      gridPosY = bombGridPos.y + (yDir * pwrIdx);
      gridObj = _getGridObject(gridPosX, gridPosY);

      // If this is a breakable brick => breaks it
      if (gridObj === OBJECTS.BRICK) {
        // TODO FIX Creating Bonus now could lead to Bonus explosing with the chain explosion
        // => A wall destroyed by 2 bombs but at the same time should not the bonus created by the first one to explode
        // => Destroy the wall and create the bonus after all the bomb have exploded
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
        _setGridObject(gridPosX, gridPosY, gridObj);
        return;
      }
      // If this is a Bonus => Destroy
      else if (gridObj === OBJECTS.BONUS_BOMB || gridObj === OBJECTS.BONUS_FLAME) {
        _setGridObject(gridPosX, gridPosY, OBJECTS.NONE);
        return;
      }
      //
      else if (gridObj === OBJECTS.NONE) {
        // Check if there is in fact a bomb here
        bomb = bombGrid[gridPosY][gridPosX];
        if (bomb) {
          // Add bomb to the exploding list
          _addToExplodingBombList(bomb);
          return;
        }
        // Else Continue
      }
      // WALL or UNKNOWN
      else {
        return;
      }

      // There is really nothing here
      pwrIdx++;
    }
  };

  var _processBomb = function() {
    var bomb, i, lng = bombs.length;
    for (i = lng-1; i >= 0; i--) {
      bomb = bombs[i];
      bomb.life--;
      if (bomb.life <= 0) {
        // Remove the Bomb and add it to the exploding bomb list
        bombs.splice(i, 1);
        explodingBombs.push(bomb);
      }
    }

    // Explode Bombs
    while (explodingBombs.length) {
      // Remove the bomb from the exploding list
      bomb = explodingBombs.pop();
      // TODO FIX: Removing Bomb from the grid now could lead with a wrong power management
      // => 2 bombs side by side the first one with a power of 1 & the second with 5
      // => The bomb 1 will make the bomb 2 to explode but as the bomb 1 is already removed from the grid, the bomb 2 will have a full power of 5 even in the firstion of bomb1
      // => It shouldn't be the case in the real bomber man
      // Remove bomb from the grid
      bombGrid[bomb.gridPos.y][bomb.gridPos.x] = null;

      // Process RIGHT
      _processBombDir(bomb.power, bomb.gridPos, 1, 0);
      // Process LEFT
      _processBombDir(bomb.power, bomb.gridPos, -1, 0);
      // Process TOP
      _processBombDir(bomb.power, bomb.gridPos, 0, 1);
      // Process BOTTOM
      _processBombDir(bomb.power, bomb.gridPos, 0, -1);

      // Update Bomber
      if (bomb.creator) {
        bomb.creator.bombs--;
        if (bomb.creator.bombs < 0) {
          console.log('ERROR: bombs < 0 for player: ' + bomb.creator.name);
          bomb.creator.bombs = 0;
        }
        bomb.creator = null;
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

      console.log('move8 ' + data + ' ' + socket.player.name);
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

