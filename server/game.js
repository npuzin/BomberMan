'use strict';


function Game(name) {

  var _id = name.replace(/ /g,'').toLowerCase();
  var _name = name;

  this.getId = function() {
    return _id;
  };

  this.getName = function() {
    return _name;
  };
}

module.exports = Game;


