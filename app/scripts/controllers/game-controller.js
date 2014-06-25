'use strict';

angular.module('BomberMan')

.controller('GameController', ['$scope', 'userSession', 'socketIO',
  function($scope, userSession, socketIO) {

  $scope.games = [];
  $scope.gameName = '';

  $scope.createGame = function () {

    if ($scope.gameName === '') {
      return;
    }
    socketIO.emit('createGame', {
      name: $scope.gameName
    });
  };

  socketIO.on('createGame', function (game) {

    $scope.games.push(game);
  });

  var loadPageData = function() {

    socketIO.emit('getListOfGames').then(function (games) {
      $scope.games = games;
    });
  };

  $scope.$on('connect', function() {

    loadPageData();
  });

  loadPageData();

}]);
