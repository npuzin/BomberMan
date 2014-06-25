'use strict';

angular.module('BomberMan')

.controller('JoinGameController', ['$scope', '$routeParams', 'socketIO', '$location', function($scope, $routeParams, socketIO, $location) {

  $scope.game= null;

  var getGameDetails = function(id) {
    socketIO.emit('joinAndGetGameDetails', id).then(function (response) {
      if (response === null) {
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

  $scope.leaveGame = function() {

    socketIO.emit('leaveGame', $scope.game.id).then(function () {
       $location.path('/home');
    });
  };

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
