'use strict';

var _ = require('underscore');
var db = require('./db.js');
var Game = require('./game.js');

function Games() {

  var _games = [];

  this.getGame = function(id) {
    return _.find(_games, function (game){
      return game.getId() === id;
    });
  };

  this.addGame = function(game) {
    _games.push(game);
    db.games.insert(game.toJson(), function (err) {
      console.log(err);
    });
  };

  this.loadGamesFromDb = function () {

    db.games.find({}, function  (err, games) {
      games.forEach(function(game) {
        var g = new Game(game.name);
        _games.push(g);
      });
    });
  };

  this.getGames = function() {
    return _games;
  };

  this.deleteGame = function(id) {
    var game = this.getGame(id);
    if (game) {
      var i = _games.indexOf(game);
      _games.splice(i,1);
      db.games.remove({
        id:id
      });
    }
  };

}

module.exports = Games;


