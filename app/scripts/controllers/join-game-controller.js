'use strict';

angular.module('BomberMan')

.controller('JoinGameController', ['$scope', '$routeParams', 'socketIO', '$location', '_',
  function($scope, $routeParams, socketIO, $location, _) {

  $scope.game= null;

  var getGameDetails = function(id) {
    socketIO.emit('joinAndGetGameDetails', id).then(function (response) {
      if (response === null || response.isStarted) {
        $location.path('/home');
      } else {
        $scope.game = response;
      }
    }, function () {
      $location.path('/home');
    });
  };

  $scope.deleteGame = function() {

    socketIO.emit('deleteGame', $scope.game.id).then(function () {
      $location.path('/home');
    });
  };

  $scope.startGame = function() {

    socketIO.emit('startGame', $scope.game.id);
  };

  $scope.$on('gameStarted', function(event, gameId) {
    if (gameId === $scope.game.id) {
      $location.path('/play/'+$scope.game.id);
    }
  });

  $scope.leaveGame = function() {

    socketIO.emit('leaveGame', $scope.game.id).then(function () {
      $location.path('/home');
    });
  };

  $scope.$on('gameDeleted', function(event, gameId) {
    if (gameId === $scope.game.id) {
      $location.path('/home');
    }
  });

  $scope.$on('userHasJoinedAGame', function(event, response) {

    if (response.gameId === $scope.game.id) {
      console.log('userHasJoinedAGame');
      $scope.game.users.push({
        username:response.username
      });
    }
  });

  $scope.$on('userHasLeftAGame', function(event, response) {
    if (response.gameId === $scope.game.id) {
      $scope.game.users = _.reject($scope.game.users, function(user) {
        return user.username === response.username;
      });
    }
  });

  var loadPageData = function() {

    getGameDetails($routeParams.gameId);
  };

  $scope.$on('connect', function() {

    loadPageData();
  });

  if (socketIO.isConnected()) {
    loadPageData();
  }

}]);
