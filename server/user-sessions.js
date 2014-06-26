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

  this.removeSession = function(session) {

    var i = _sessions.indexOf(session);
    if (i !== -1) {
      _sessions.splice(i,1);
    }

  };

  this.toJson = function() {
    var result = [];
    _sessions.forEach(function(session) {
      result.push(session.toJson());
    });
    return result;
  };

  this.contains = function(session) {
    return _.contains(_sessions, session);
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

  this.addSession = function (userSession) {
    _sessions.push(userSession);
  };

  this.getListOfUsers = function() {
    return _.map(_sessions, function (session) {
      return session.getUserName();
    });
  };
}

module.exports = UserSessions;


