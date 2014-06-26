'use strict';

angular.module('BomberMan')

.controller('HomeController', ['$scope', 'userSession', 'socketIO', '$log', '$location', function($scope, userSession, socketIO, $log, $location) {

  $scope.userName = userSession.getUserName();
  $scope.socketIO = socketIO;
  $scope.users = [];

  $scope.getListOfUsers = function () {

    socketIO.emit('getListOfUsers').then(function (result) {
      $scope.users = result.data;
    });
  };

  $scope.$on('userHasLoggedIn', function (event, user) {

    $scope.users.push(user);
  });

  $scope.$on('userHasLoggedOut', function (event, user) {

    var i = $scope.users.indexOf(user);
    $scope.users.splice(i,1);
  });


  $scope.logout = function() {

    userSession.logout().then(function () {

      $location.path('/');
    });
  };

  var loadPageData = function() {
    $scope.getListOfUsers();
  };

  $scope.$on('connect', function() {

    loadPageData();
  });

  if (socketIO.isConnected()) {
    loadPageData();
  }
}]);
