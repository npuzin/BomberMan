'use strict';

angular.module('BomberMan')

  .controller('HomeController', ['$scope', '$rootScope', 'clientGame', '$http', function ($scope,$rootScope, clientGame, $http) {

    $scope.gameHasStarted = false;
    $scope.nbPlayersInTheGame = 0;
    $scope.frameRate = '';
	  $scope.score = 0;
    $scope.clientGame = clientGame;

    $http.get('/server/colors').then(function (response) {
      $scope.availableColors = response.data.colors;
      $scope.playerColor = $scope.availableColors[0];
    });

    $(document).on('keydown', function (event) {

      var key = event.which;
      clientGame.keyDown(key);
    });

    $(document).on('keyup', function (event) {

      var key = event.which;
      clientGame.keyUp(key);
    });

    $scope.connect = function() {
      clientGame.connect($scope.playerColor);
    };

    $scope.disconnect = function() {
      clientGame.disconnect();
    };

  }]);
