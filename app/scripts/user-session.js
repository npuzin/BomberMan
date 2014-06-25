'use strict';

angular.module('BomberMan')

.service('userSession', ['socketIO','$q', '$cookies', function (socketIO,$q,$cookies) {

  var getUserName = function() {
    return $cookies.username;
  };

  var isLoggedIn = function() {
    return angular.isDefined($cookies.username);
  };

  var logout = function() {

    var dfr = $q.defer();
    socketIO.emit('logout').then(function () {

      delete $cookies.username;
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
        $cookies.username = result.data;
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
