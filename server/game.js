'use strict';

var UserSessions = require('./user-sessions.js');
var db = require('./db.js');

function Game(name) {

  var _id = name.replace(/ /g,'').toLowerCase();
  var _name = name;
  var _users = new UserSessions();
  var _isStarted = false;

  this.toJson = function () {
    return {
      id: this.getId(),
      name: this.getName(),
      users: _users.toJson(),
      isStarted: this.isStarted()
    };
  };

  this.getId = function() {
    return _id;
  };

  this.getName = function() {
    return _name;
  };

  this.isStarted = function() {
    return _isStarted;
  };

  this.joinGame = function(user) {
    if (_isStarted) {
      return false;
    }
    if (!_users.contains(user)) {
      _users.addSession(user);
      return true;
    } else {
      return false;
    }
  };

  this.leaveGame = function(user) {
    if (_users.contains(user)) {
      _users.removeSession(user);
      return true;
    } else {
      return false;
    }
  };

  this.run = function() {
    _isStarted = true;
    console.log('run game' + _id);
  };

  this.getUsersInTheGame = function() {
    return _users.getListOfUsers();
  };
}

module.exports = Game;


