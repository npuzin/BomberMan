'use strict';

var express = require('express');
var Socket = require('./socket');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var UserSessions = require('./user-sessions.js');
var Games = require('./games.js');
var Game = require('./game.js');
var _ = require('underscore');

app.use(express.static(__dirname + './../app'));

var userSessions = new UserSessions();
var games = new Games();

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
    io.emit('sendMessage', {
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
    var result = _.map(games.getGames(), function (game) {
      return {
        id: game.getId(),
        name: game.getName(),
        userCount: game.getUsersInTheGame().length
      };
    });
    ack(result);
  });

  socket.on('createGame', function(name) {
    console.log('createGame');
    var game = new Game(name);
    games.addGame(game);
    io.emit('createGame', {
      id: game.getId(),
      name: game.getName(),
      userCount: game.getUsersInTheGame.length
    });
  });

  var getGame = function(id,ack) {
    var game = games.getGame(id);
    if (game) {

      var users = _.map(game.getUsersInTheGame(), function (user) {
        return {
          username: user
        };
      });

      ack({
        id: game.getId(),
        name: game.getName(),
        users: users
      });
    } else {
      ack(null);
    }
  };

  socket.on('getGame', function(id, ack) {
    console.log('getGame ' + id);
    getGame(id,ack);
  });

  socket.on('deleteGame', function(id, ack) {
    console.log('deleteGame ' + id);
    games.deleteGame(id);
    ack();
  });

  socket.on('leaveGame', function(id, ack) {
    console.log('leaveGame ' + id);
    games.leaveGame(id, socket.userSession);
    ack();
  });

  socket.on('joinGame', function(id, ack) {
    console.log('joinGame ' + id);
    games.joinGame(socket.userSession);
    ack();
  });

  socket.on('joinAndGetGameDetails', function(gameId, ack) {
    console.log('joinAndGetGameDetails');
    games.joinGame(gameId, socket.userSession);
    getGame(gameId,ack);
  });


});

httpServer.listen(9001);

