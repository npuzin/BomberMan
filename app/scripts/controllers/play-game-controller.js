'use strict';

angular.module('BomberMan')

.controller('PlayGameController', ['$scope', 'socketIO', '$location', '$routeParams', '_', 'Game',
  function($scope, socketIO, $location, $routeParams, _, Game) {

  $scope.game= null;
  var game = null;
  var c = document.getElementById('myCanvas');
  var ctx = c.getContext('2d');

  var getGameDetails = function(id) {
    socketIO.emit('joinAndGetGameDetails', id).then(function (response) {
      if (response === null) {
        $location.path('/home');
      } else {
        if (!response.isStarted) {
          $location.path('/join/' + response.id);
        } else {
          $scope.game = response;
          game = new Game($scope.game, ctx);
          game.run();
        }
      }
    }, function () {
      $location.path('/home');
    });
  };

  $scope.$on('keydown', function (event, key) {
    if (game) {
      game.keyDown(key);
    }
  });

  $scope.$on('keyup', function (event, key) {
    if (game) {
      game.keyUp(key);
    }
  });

  $scope.getCommaSeparatedListOfUsers = function () {
    if (!$scope.game) {
      return '';
    }
    return _.map($scope.game.users, function (user) {
      return user.username;
    }).join(', ');

  } ;

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
