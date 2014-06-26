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

  socket.on('createGameAndJoin', function(name, ack) {
    console.log('createGame');
    var game = new Game(name);
    game.joinGame(socket.userSession);
    games.addGame(game);
    io.emit('gameCreated', {
      id: game.getId(),
      name: game.getName(),
      userCount: game.getUsersInTheGame().length
    });
    ack(game.getId());
  });

  var getGame = function(game,ack) {

    if (game) {

      var users = _.map(game.getUsersInTheGame(), function (user) {
        return {
          username: user
        };
      });

      ack({
        id: game.getId(),
        isStarted: game.isStarted(),
        name: game.getName(),
        users: users
      });
    } else {
      ack(null);
    }
  };

  socket.on('getGame', function(id, ack) {
    console.log('getGame ' + id);
    var game = games.getGame(id);
    getGame(game,ack);
  });

  socket.on('deleteGame', function(id, ack) {
    console.log('deleteGame ' + id);
    games.deleteGame(id);
    ack();
    io.emit('gameDeleted', id);
  });

  socket.on('startGame', function(id) {
    console.log('startGame ' + id);
    var game = games.getGame(id);
    game.run();
    io.emit('gameStarted', id);
  });

  socket.on('leaveGame', function(id, ack) {
    console.log('leaveGame ' + id);
    var game = games.getGame(id);
    var hasLeft = game.leaveGame(socket.userSession);
    ack();
    if (hasLeft) {
      io.emit('nbUsersInGameHasChanged', {
        gameId: id,
        userCount: game.getUsersInTheGame().length
      });
      socket.broadcast.emit('userHasLeftAGame', {
        gameId: id,
        username: socket.userSession.getUserName()
      });
    }
  });

  socket.on('joinAndGetGameDetails', function(gameId, ack) {
    console.log('joinAndGetGameDetails');
    var game = games.getGame(gameId);
    var hasJoined = game.joinGame(socket.userSession);
    getGame(game,ack);
    if (hasJoined) {
      io.emit('nbUsersInGameHasChanged', {
        gameId: gameId,
        userCount: game.getUsersInTheGame().length
      });
      socket.broadcast.emit('userHasJoinedAGame', {
        gameId: gameId,
        username: socket.userSession.getUserName()
      });
    }
  });


});

httpServer.listen(9001);

