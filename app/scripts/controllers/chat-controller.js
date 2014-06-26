'use strict';

angular.module('BomberMan')

.controller('ChatController', ['$scope', 'userSession', 'socketIO', 'chat', function($scope, userSession, socketIO, chat) {

  $scope.chatMessage = '';
  $scope.chatMessages = chat.getMessages();

  $scope.sendMessage = function() {

    socketIO.emit('sendMessage',$scope.chatMessage);

  };

  $scope.$on('messageSent', function(event, data) {

    chat.appendMessage(data.user, data.message);
    $scope.chatMessages = chat.getMessages();
    $scope.chatMessage = '';
    var textarea = $('#chatDiv textarea');
    textarea.scrollTop(textarea[0].scrollHeight);
  });


}]);
