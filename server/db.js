'use strict';

var Datastore = require('nedb');
var db = {};
db.games = new Datastore({ filename: './server/db/games.txt', autoload: true });

module.exports = db;


