'use strict';

angular.module('BomberMan')

.factory('clientGame', ['socketIO', '$rootScope', '$interval', function (socketIO, $rootScope, $interval) {

  var c = document.getElementById('myCanvas');
  var ctx = c.getContext('2d');
  var KEY = {UP:38,DOWN:40,LEFT:37,RIGHT:39,SPACE:32};
  var currentKeyPressed = KEY.NONE;
  var playerColor = null;
  var MOVE = {NONE:'none',LEFT:'left',RIGHT:'right',UP:'up',DOWN:'down'};
  var myId;
  var frameRate = 0;
  var gameHasStarted = false;
  var nbRefresh = 0;
  var drawingData = null;

  var connect = function (color) {
    playerColor = color;
    var isNewConnection = socketIO.connect();

    if (isNewConnection) {
      socketIO.on('connect', function() {
        socketIO.emit('connect-player', playerColor);
      });
    }

    socketIO.on('drawingData', function(data) {
      drawingData = data;
      refresh();
      $rootScope.$apply();
    });

    socketIO.on('myID', function(data) {
		  myId = data.id;
    });
  };

  var disconnect = function() {
    socketIO.off('myID');
	  socketIO.off('drawingData');
    socketIO.emit('disconnect-player', {});
    gameHasStarted = false;
  };

  var keyDown = function(key) {
    // Special case for the action that do not interrupt the current move
    if (key === KEY.SPACE) {
        socketIO.emit('action');
        return;
    }

    if (key !== currentKeyPressed) {

      currentKeyPressed = key;
      switch(key) {
      case KEY.UP:
        socketIO.emit('move',MOVE.UP);
        break;
      case KEY.DOWN:
        socketIO.emit('move',MOVE.DOWN);
        break;
      case KEY.LEFT:
        socketIO.emit('move',MOVE.LEFT);
        break;
      case KEY.RIGHT:
        socketIO.emit('move',MOVE.RIGHT);
        break;
      }
    }
  };

  var initCanvas = function() {

    ctx.canvas.width = drawingData.canvasSize.width;
    ctx.canvas.height = drawingData.canvasSize.height;

  };

  var clearRect = function() {
    ctx.clearRect(0,0,drawingData.canvasSize.width,drawingData.canvasSize.height);
  };

  var refreshFrameRate = function () {

    $interval(function() {

      frameRate = nbRefresh;
      nbRefresh = 0;

    },1000);
  };

  refreshFrameRate();

  var keyUp = function (key) {

    if (key === KEY.UP) {
      socketIO.emit('stopMove',MOVE.UP);
    } else if (key === KEY.DOWN) {
      socketIO.emit('stopMove',MOVE.DOWN);
    } else if (key === KEY.LEFT) {
      socketIO.emit('stopMove',MOVE.LEFT);
    } else if (key === KEY.RIGHT) {
      socketIO.emit('stopMove',MOVE.RIGHT);
    }

    if (key === currentKeyPressed) {
      currentKeyPressed = KEY.NONE;
    }
  };

  var drawGrid = function() {
    var lngX, lngY = drawingData.grid?drawingData.grid.length:0;
    for (var y = 0; y < lngY; y++) {
      lngX = drawingData.grid[y]?drawingData.grid[y].length:0;
      for (var x = 0; x < lngX; x++) {
        if (drawingData.grid[y][x] === 1) {
          ctx.fillStyle = 'gray';
          ctx.fillRect(x*10, y*10, 10, 10);
        }
        else if (drawingData.grid[y][x] === 2) {
          ctx.fillStyle = 'LightGray';
          ctx.fillRect(x*10, y*10, 10, 10);
        }
      }
    }
  };

  var drawBombs = function() {
    var bomb, lng = drawingData.bombs?drawingData.bombs.length:0;
    for (var i = 0; i < lng; i++) {
      bomb = drawingData.bombs[i];
      if (bomb.life < 10) {
        ctx.fillStyle = 'red';
      }
      else {
        ctx.fillStyle = 'black';
      }
      ctx.fillRect(bomb.pos.x, bomb.pos.y, 10, 10);
    }
  };

  var drawApple = function() {
    if (drawingData.apple) {
      ctx.fillStyle = 'green';
      ctx.fillRect(drawingData.apple.pos.x, drawingData.apple.pos.y, drawingData.appleSize.width, drawingData.appleSize.height);
    }
  };

  var drawPlayer = function(player, playerSize) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.position.x,player.position.y,playerSize.width,playerSize.height);
  };

  var drawPlayers = function() {
    drawingData.players.forEach(function(player) {
      drawPlayer(player, drawingData.playerSize);
    });
  };

  var getFrameRate = function() {
    return frameRate;
  };

  var getNbPlayers = function() {
    if (!drawingData || !drawingData.players) {
      return 0;
    }
    return drawingData.players.length;
  };

  var getCurrentPlayer = function () {

    if (!drawingData || !drawingData.players) {
      return null;
    }
    return _.find(drawingData.players, function (player) {
      return player.id === myId;
    });
  };

  var getGameHasStarted = function () {
    return gameHasStarted;
  };

  var getScore = function () {
    var player = getCurrentPlayer();
    if (player) {
      return player.score;
    } else {
      return 0;
    }
  };

  var refresh = function () {

    if (!gameHasStarted) {

      gameHasStarted = true;
      initCanvas();
    }

    clearRect();
    drawGrid();
    drawPlayers();
	  drawApple();
    drawBombs();

    nbRefresh++;
  };

  return {
    connect: connect,
    disconnect: disconnect,
    keyDown: keyDown,
    keyUp: keyUp,
    getFrameRate: getFrameRate,
    getNbPlayers: getNbPlayers,
    getGameHasStarted: getGameHasStarted,
    getScore: getScore
  };

}]);
