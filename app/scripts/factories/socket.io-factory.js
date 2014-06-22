/* global io */
'use strict';

angular.module('BomberMan')

.factory('socketIO', [function () {

  var socket = null;
  var connect = function() {
    if (socket) {
      socket.connect(); //reconnection
      return false;
    } else {
      socket = io.connect();
      return true;
    }
  };

  var on = function(eventName, callback) {
    socket.on(eventName, callback);
  };

  var off = function(eventName) {
    socket.off(eventName);
  };

  var emit = function(eventName, data) {
    socket.emit(eventName, data);
  };

  return {
    emit:emit,
    connect: connect,
    on: on,
    off: off
  };

}]);
