'use strict';

angular.module('BomberMan')

.factory('ioListeners', ['$rootScope', 'socketIO', function($rootScope, socketIO){


  var bindListeners = function() {

    socketIO.on('userHasJoinedAGame', function(response) {
      $rootScope.$broadcast('userHasJoinedAGame', response);
    });

    socketIO.on('messageSent', function(response) {
      $rootScope.$broadcast('messageSent', response);
    });

    socketIO.on('gameCreated', function(response) {
      $rootScope.$broadcast('gameCreated', response);
    });

    socketIO.on('gameDeleted', function(response) {
      $rootScope.$broadcast('gameDeleted', response);
    });

    socketIO.on('nbUsersInGameHasChanged', function(response) {
      $rootScope.$broadcast('nbUsersInGameHasChanged', response);
    });

    socketIO.on('userHasLoggedIn', function(response) {
      $rootScope.$broadcast('userHasLoggedIn', response);
    });

    socketIO.on('userHasLoggedOut', function(response) {
      $rootScope.$broadcast('userHasLoggedOut', response);
    });

    socketIO.on('gameStarted', function(response) {
      $rootScope.$broadcast('gameStarted', response);
    });
    socketIO.on('gameDeleted', function(response) {
      $rootScope.$broadcast('gameDeleted', response);
    });
    socketIO.on('userHasLeftAGame', function(response) {
      $rootScope.$broadcast('userHasLeftAGame', response);
    });


  };

  return {
    bindListeners:bindListeners
  };

}]);
