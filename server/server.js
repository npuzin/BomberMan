'use strict';

var express = require('express');
var Socket = require('./socket');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var UserSessions = require('./user-sessions.js');
var GameService = require('./game-service.js');
var gameService = new GameService(io);
app.use(express.static(__dirname + './../app'));

var userSessions = new UserSessions();

var parseCookie = function(cookie) {

  if (!cookie) {
    return {};
  }
  var c = cookie.split(';');
  var result = {};
  c.forEach(function(curr) {

    var values = curr.split('=');
    result[values[0].trim()] = values[1].trim();
  });
  return result;
};

process.on('uncaughtException', function (exception) {
  console.log(exception.stack);
});

io.on('connection', function (_socket) {
  console.log('new connection open');

  var socket= new Socket(_socket);
  var cookies = parseCookie(_socket.handshake.headers.cookie);
  if (cookies.username) {
    if (userSessions.getSession(cookies.username)) {
      socket.userSession = userSessions.getSession(cookies.username);
    } else {
      socket.userSession = userSessions.createSession(cookies.username);
    }
  }

  socket.on('login', function(username, ack) {

    console.log('login');
    var userSession = userSessions.createSession(username);
    if (userSession) {
      socket.userSession = userSession;
      ack({
        success:true,
        data:username
      });
      socket.broadcast.emit('userHasLoggedIn', username);
    } else {
      ack({
        success: false,
        error: 'user already exists',
        data: username
      });
    }
  });

  socket.on('logout', function(data, ack) {
    console.log('logout');
    if (socket.userSession) {
      socket.broadcast.emit('userHasLoggedOut',  socket.userSession.getUserName());
      userSessions.destroySession(socket.userSession.getUserName());
    }
    ack();
  });

  socket.on('sendMessage', function (data, ack) {
    console.log('sendMessage');
    io.emit('messageSent', {
      user: socket.userSession.getUserName(),
      message:data
    });
    ack();
  });

  socket.on('getListOfUsers', function(data, ack) {
    console.log('getListOfUsers');
    ack( {
      success: true,
      data:  userSessions.getListOfUsers()
    });
  });

  gameService.bindEvents(socket);

});

httpServer.listen(9001);

