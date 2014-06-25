'use strict';

angular.module('BomberMan')

.controller('HomeController', ['$scope', 'userSession', 'socketIO', '$log', '$location', function($scope, userSession, socketIO, $log, $location) {

  $scope.userName = userSession.getUserName();

  $scope.socketIO = socketIO;
  $scope.users = [];

  $scope.getListOfUsers = function () {

    socketIO.emit('getListOfUsers').then(function (result) {
      console.log(result);
      $scope.users = result.data;
    });
  };

  socketIO.on('userHasLoggedIn', function (user) {
    console.log('userHasLoggedIn');
    $scope.users.push(user);
  });

  socketIO.on('userHasLoggedOut', function (user) {
    console.log('userHasLoggedOut');
    var i = $scope.users.indexOf(user);
    $scope.users.splice(i,1);
  });


  $scope.logout = function() {

    userSession.logout().then(function () {
      console.log('user has loggout');
      $location.path('/');
    }, function () {
      $log.error('logout failed');
    });
  };

  $scope.getListOfUsers();
}]);
