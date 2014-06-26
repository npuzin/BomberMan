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

}

module.exports = Games;


