'use strict';

var Q = require('q');

function Socket(socket) {

  var _socket = socket;
  var DEFAULT_TIMEOUT = 2000;

  this.broadcast = {};

  this.emit = function (eventName, data) {

    var dfr = Q.defer();

    var timeout = setTimeout(function () {
      dfr.reject();
    }, DEFAULT_TIMEOUT);

    _socket.emit(eventName, data, function (result) {

      clearTimeout(timeout);
      dfr.resolve(result);

    });

    return dfr.promise;
  };

  this.on = function (eventName, callback) {
    _socket.on(eventName, callback);
  };

  this.broadcast.emit = function (eventName, data) {
    _socket.broadcast.emit(eventName, data);
  };

}

module.exports = Socket;


