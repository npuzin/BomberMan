'use strict';


function UserSession(username) {

  var _username = username;

  this.getUserName = function() {
    return _username;
  };

}

module.exports = UserSession;


