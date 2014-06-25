'use strict';

/* factory so that underscore can be injected as dependency */
angular.module('BomberMan')

  .factory('_', ['$window', function($window){

    if ($window._) {
      $window.__underscore = $window._;
      try {
        delete $window._;
      } catch (e) {
        $window._ = undefined;
      }
    }
    return $window.__underscore;
  }]);


