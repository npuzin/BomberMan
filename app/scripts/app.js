'use strict';

angular.module('BomberMan', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'templates/views/home.html',
        controller: 'HomeController',
      })
      .otherwise({
        redirectTo: '/'
      });

  }])

  .run(['$log', function ($log) {

    $log.debug('application started');
  }]);


