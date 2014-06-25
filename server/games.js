'use strict';

var _ = require('underscore');

function Games() {

  var _games = [];

  this.getGame = function(id) {
    return _.find(_games, function (game){
      return game.getId() === id;
    });
  };

  this.addGame = function(game) {
    _games.push(game);
  };

  this.getGames = function() {
    return _games;
  };

  this.deleteGame = function(id) {
    var game = this.getGame(id);
    if (game) {
      var i = _games.indexOf(game);
      _games.splice(i,1);
    }
  };

  this.joinGame = function(gameId, user) {
    var game = this.getGame(gameId);
    if (game) {
      game.joinGame(user);
    }
  };

  this.leaveGame = function(gameId, user) {
    var game = this.getGame(gameId);
    if (game) {
      game.leaveGame(user);
    }
  };
}

module.exports = Games;


