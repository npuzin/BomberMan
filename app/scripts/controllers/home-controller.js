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

  socketIO.on('userHasLoggedIn', function (user) {

    $scope.users.push(user);
  });

  socketIO.on('userHasLoggedOut', function (user) {

    var i = $scope.users.indexOf(user);
    $scope.users.splice(i,1);
  });


  $scope.logout = function() {

    userSession.logout().then(function () {

      $location.path('/');
    });
  };


  if (socketIO.isConnected()) {
    $scope.getListOfUsers();
  } else {
    socketIO.on('connect', function() {
      $scope.getListOfUsers();
    });
  }

}]);
