'use strict';

angular.module('BomberMan')

.controller('JoinGameController', ['$scope', '$routeParams', function($scope, $routeParams) {

  $scope.game= {
    id: $routeParams.gameId
  };

}]);
