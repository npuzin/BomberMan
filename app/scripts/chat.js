'use strict';

angular.module('BomberMan')

.factory('chat', [function(){

  var _content = '';

  var appendMessage = function(user, message) {
    var lineBreak = '';
    if (_content !== '') {
      lineBreak = '\n';
    }
    _content = _content + lineBreak + user + ': ' + message;

    return _content;
  };

  var getMessages = function() {
    return _content;
  };

  return {
    appendMessage: appendMessage,
    getMessages: getMessages
  };

}]);
