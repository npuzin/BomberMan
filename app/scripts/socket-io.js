/* global io */
'use strict';

angular.module('BomberMan')

.factory('socketIO', ['$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout){


  var _isConnected = false;
  var DEFAULT_TIMEOUT = 3000;

  var socket = io.connect();

  var isConnected = function () {
    return _isConnected;
  };

  var on = function (eventName, callback) {

    socket.on(eventName, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });

  };

  var emit = function (eventName, data) {

    var dfr = $q.defer();

    var timeout = $timeout(function () {
      $rootScope.$apply(function () {
        dfr.reject('acknowledgment not received');
      });
    }, DEFAULT_TIMEOUT);

    socket.emit(eventName, data, function (result) {
      $rootScope.$apply(function () {
        $timeout.cancel(timeout);
        dfr.resolve(result);
      });
    });

    return dfr.promise;
  };

  on('connect', function () {
    socket.sendBuffer = [];
    socket.acks = {};
    _isConnected = true;
  });

  on('disconnect', function () {
    _isConnected = false;
  });

  return {
    emit:emit,
    isConnected: isConnected,
    on: on
  };

}]);
