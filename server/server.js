'use strict';



var express = require('express');
var Socket = require('./socket');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var UserSessions = require('./user-sessions.js');
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

var games = [];

io.on('connection', function (_socket) {
  console.log('new connection open');

  var socket= new Socket(_socket);
  var cookies = parseCookie(_socket.handshake.headers.cookie);
  if (cookies.username && userSessions.getSession(cookies.username)) {
    socket.userSession = userSessions.getSession(cookies.username);
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
    console.log('user session created for user ' + username);
  });

  socket.on('logout', function(data, ack) {
    console.log('logout');
    if (socket.userSession) {
      console.log('user ' + socket.userSession.getUserName() + ' has loggout');
      socket.broadcast.emit('userHasLoggedOut',  socket.userSession.getUserName());
      userSessions.destroySession(socket.userSession.getUserName());
    }
    ack();
  });

  socket.on('sendMessage', function (data, ack) {

    socket.broadcast.emit('sendMessage', {
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

  socket.on('getListOfGames', function(data, ack) {
    console.log('getListOfGames');
    ack(games);
  });

  socket.on('createGame', function(game) {
    console.log('createGame');
    var gameId = game.name.replace(/ /g,'').toLowerCase();
    var gameObj = {
      id: gameId,
      name:game.name
    };
     games.push(gameObj);
    io.emit('createGame', gameObj);
  });

});

httpServer.listen(9001);

