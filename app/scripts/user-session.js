'use strict';

angular.module('BomberMan')

.service('userSession', ['socketIO','$q', function (socketIO,$q) {

  var _isLoggedIn = false;
  var _username = null;

  var getUserName = function() {
    return _username;
  };

  var isLoggedIn = function() {
    return _isLoggedIn;
  };

  var logout = function() {

    var dfr = $q.defer();
    socketIO.emit('logout').then(function () {

      _isLoggedIn = false;
      _username = null;
      dfr.resolve();
    }, function () {
      dfr.reject();
    });

    return dfr.promise;
  };

  var login = function(username) {

    var dfr = $q.defer();

    socketIO.emit('login', username).then(function (result) {

      if (result.success) {
        _isLoggedIn = true;
        _username = result.data;
        dfr.resolve(result);
      } else {
        dfr.reject(result.error);
      }

    }, function (result) {
      dfr.reject(result);
    });

    return dfr.promise;
  };
  return {
    getUserName: getUserName,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn
  };

}]);
