'use strict';

angular.module('BomberMan')

.controller('CreateGameController', ['$scope', 'userSession', 'socketIO', '$location', '_',
  function($scope, userSession, socketIO, $location, _) {

  $scope.games = [];
  $scope.gameName = '';

  $scope.createGame = function () {

    if ($scope.gameName === '') {
      return;
    }
    socketIO.emit('createGameAndJoin', $scope.gameName).then(function(gameId) {
      $location.path('/join/' + gameId);
    });
  };

  socketIO.on('gameCreated', function (game) {

    $scope.games.push(game);
  });

  socketIO.on('gameDeleted', function(gameId) {
    $scope.games = _.reject($scope.games, function (game) {
      return game.id === gameId;
    });
  });

  socketIO.on('nbUsersInGameHasChanged', function(response) {
    var game = _.find($scope.games, function (game) {
      return game.id === response.gameId;
    });
    if (game) {
      game.userCount = response.userCount;
    }
  });

  var loadPageData = function() {

    socketIO.emit('getListOfGames').then(function (games) {
      $scope.games = games;
    });
  };

  $scope.$on('connect', function() {

    loadPageData();
  });

  if (socketIO.isConnected()) {
    loadPageData();
  }
}]);
