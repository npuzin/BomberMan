'use strict';

angular.module('BomberMan', ['ngRoute'])

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
      .otherwise({
        redirectTo: '/'
      });

  }])

  .run(['$log', '$rootScope', 'userSession', '$location', function ($log,$rootScope, userSession, $location) {

    $log.debug('application started');

    $rootScope.$on('$routeChangeStart', function(){

        var path = $location.path();

        if(!userSession.isLoggedIn() && (path !== '/login' && $location.path() !== '/')){
          $location.path('/login');
        }

      }
    );
  }]);


