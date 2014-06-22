'use strict';

var express = require('express');
var app = express();
var httpServer = require('http').Server(app);

var game = require('./game')(httpServer);

app.use(express.static(__dirname + './../app'));

app.get('/server/colors',  function (req, res) {
  res.send({
    colors: game.getAvailableColors()
  });
});

game.run();
httpServer.listen(9001);

