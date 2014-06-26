'use strict';

angular.module('BomberMan')

.factory('Game', ['$interval', function ($interval) {

  function Game(gameDetails, canvasContext) {

    var _gameDetails = gameDetails;
    var _ctx = canvasContext;
    var FRAME_RATE = 60;

    var paint = function() {
      _ctx.clearRect(0,0,_ctx.canvas.width,_ctx.canvas.height);
      _ctx.fillStyle = 'gray';
      _ctx.fillRect(0, 0, 10, 10);
    };

    this.run = function () {

      $interval(function() {

        paint();
      }, 1000 / FRAME_RATE);

    };
  }

  return Game;

}]);
