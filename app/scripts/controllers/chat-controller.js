'use strict';

angular.module('BomberMan')

.controller('ChatController', ['$scope', 'userSession', 'socketIO', function($scope, userSession, socketIO) {


  $scope.chatMessage = null;
  $scope.chatMessages = '';

  var appendMessage = function(user, message) {
    var lineBreak = '';
    if ($scope.chatMessages !== '') {
      lineBreak = '\n';
    }
    $scope.chatMessages = $scope.chatMessages + lineBreak + user + ': ' + message;
    $scope.chatMessage = '';

    var textarea = $('#chatDiv textarea');
    textarea.scrollTop(textarea[0].scrollHeight);
  };

  $scope.sendMessage = function() {

    socketIO.emit('sendMessage',$scope.chatMessage).then(function () {
      appendMessage(userSession.getUserName(), $scope.chatMessage);
    });

  };


  socketIO.on('sendMessage', function(data) {

    appendMessage(data.user,data.message);
  });


}]);