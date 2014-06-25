'use strict';

var _ = require('underscore');
var UserSession = require('./user-session.js');

function UserSessions() {

  var _sessions = [];

  this.getSession = function(username) {
    return _.find(_sessions, function (session){
      return session.getUserName() === username;
    });
  };

  this.destroySession = function(username) {
    var session = this.getSession(username);
    if (session) {
      var i = _sessions.indexOf(session);
      _sessions.splice(i,1);
    }
  };

  this.createSession = function(username) {
    if (!this.getSession(username)) {
      var newSession = new UserSession(username);
      _sessions.push(newSession);
      return newSession;
    }
  };

  this.getListOfUsers = function() {
    return _.map(_sessions, function (session) {
      return session.getUserName();
    });
  };
}

module.exports = UserSessions;


