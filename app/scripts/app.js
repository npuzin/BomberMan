'use strict';

angular.module('BomberMan', ['ngRoute', 'ngCookies'])

  .config(['$routeProvider', function ($routeProvider) {

    $routeProvider
      .when('/home', {
        templateUrl: 'templates/views/home.html',
        controller: 'HomeController',
      })
      .when('/', {
        templateUrl: 'templates/views/login.html',
        controller: 'LoginController',
      })
      .when('/join/:gameId', {
        templateUrl: 'templates/views/join-game.html',
        controller: 'JoinGameController',
      })
      .when('/play/:gameId', {
        templateUrl: 'templates/views/play-game.html',
        controller: 'PlayGameController',
      })
      .otherwise({
        redirectTo: '/'
      });

  }])

  .run(['$log', '$rootScope', 'userSession', '$location', 'ioListeners', function ($log, $rootScope, userSession, $location, ioListeners) {

    $log.debug('application started');

    ioListeners.bindListeners();

    $rootScope.$on('$routeChangeStart', function(){

        var path = $location.path();

        if(!userSession.isLoggedIn() && (path !== '/login' && $location.path() !== '/')){
          $location.path('/login');
        } else if (userSession.isLoggedIn() && path === '/') {
          $location.path('/home');
        }

      }
    );
  }]);


