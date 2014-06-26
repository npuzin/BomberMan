'use strict';

var _ = require('underscore');
var Games = require('./games.js');
var Game = require('./game.js');

function GameService(io) {

  var games = new Games();

  this.bindEvents = function (socket) {

    socket.on('getListOfGames',  function(data, ack) {
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

    socket.on('getGame', function(id, ack) {
      console.log('getGame ' + id);
      var game = games.getGame(id);
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
      if (game) {
        var hasJoined = game.joinGame(socket.userSession);

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
      } else {
        ack(null);
      }
    });

  };

}

module.exports = GameService;


