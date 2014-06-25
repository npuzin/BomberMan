'use strict';

angular.module('BomberMan')

.controller('LoginController', ['$scope', 'userSession', '$location',
  function($scope, userSession, $location) {

  $scope.errorMessage = '';
  $scope.username = '';

  $scope.login = function () {

    $scope.errorMessage = '';
    userSession.login($scope.username).then(function () {

      $location.path('/home');
    }, function (error) {

      $scope.errorMessage = error;
    });
  };

  $('#tbUserName').focus();


}]);
