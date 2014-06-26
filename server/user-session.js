'use strict';


function UserSession(username) {

  var _username = username;

  this.getUserName = function() {
    return _username;
  };

  this.toJson = function() {
    return {
      username: this.getUserName()
    };
  };
}

module.exports = UserSession;


