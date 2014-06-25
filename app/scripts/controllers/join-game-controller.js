'use strict';

angular.module('BomberMan')

.controller('JoinGameController', ['$scope', '$routeParams', 'socketIO', '$location', function($scope, $routeParams, socketIO, $location) {

  $scope.game= null;

  var getGameDetails = function(id) {
    socketIO.emit('getGame', id).then(function (response) {
      $scope.game = response;
    }, function () {
      $location.path('/home');
    });
  };


  var loadPageData = function() {

    getGameDetails($routeParams.gameId);
  };

  $scope.$on('connect', function() {

    loadPageData();
  });

  loadPageData();

}]);
