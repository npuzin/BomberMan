'use strict';

var UserSessions = require('./user-sessions.js');

function Game(name) {

  var _id = name.replace(/ /g,'').toLowerCase();
  var _name = name;
  var _users = new UserSessions();

  this.getId = function() {
    return _id;
  };

  this.getName = function() {
    return _name;
  };

  this.joinGame = function(user) {
    if (!_users.contains(user)) {
      _users.addSession(user);
    }
  };

  this.leaveGame = function(user) {
    _users.removeSession(user);
  };

  this.getUsersInTheGame = function() {
    return _users.getListOfUsers();
  };
}

module.exports = Game;


