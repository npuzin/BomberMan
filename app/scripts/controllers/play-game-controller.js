'use strict';

angular.module('BomberMan')

.controller('PlayGameController', ['$scope', 'socketIO', '$location', '$routeParams', '_',
  function($scope, socketIO, $location, $routeParams, _) {

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
