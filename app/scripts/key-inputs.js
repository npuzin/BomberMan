'use strict';

angular.module('BomberMan')

.factory('keyInputs', ['$rootScope', function($rootScope){


  var KEY = {UP:38,DOWN:40,LEFT:37,RIGHT:39,SPACE:32};

  var bindListeners = function () {

    $(document).on('keydown', function (event) {

      var key = event.which;
      $rootScope.$broadcast('keydown', key);
    });

    $(document).on('keyup', function (event) {

      var key = event.which;
      $rootScope.$broadcast('keyup', key);
    });
  };


  return {
    KEY:KEY,
    bindListeners:bindListeners
  };

}]);
