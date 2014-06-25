'use strict';

angular.module('BomberMan')

.controller('ChatController', ['$scope', 'userSession', 'socketIO', function($scope, userSession, socketIO) {


  $scope.chatMessage = null;
  $scope.chatMessages = '';

  $scope.sendMessage = function() {

    var lineBreak = '';
    if ($scope.chatMessages !== '') {
      lineBreak = '\n';
    }
    $scope.chatMessages = $scope.chatMessages + lineBreak + userSession.getUserName() + ': ' + $scope.chatMessage;
    $scope.chatMessage = '';

    var textarea = $('#chatDiv textarea');
    textarea.scrollTop(textarea[0].scrollHeight);

  };



}]);
