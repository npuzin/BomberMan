'use strict';



var express = require('express');
var Socket = require('./socket');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var UserSessions = require('./user-sessions.js');
app.use(express.static(__dirname + './../app'));

var userSessions = new UserSessions();


io.on('connection', function (_socket) {
  console.log('new connection open');

  var socket= new Socket(_socket);

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

  socket.on('disconnect', function () {
    if (socket.userSession) {
      console.log('user ' + socket.userSession.getUserName() + ' has been disconnected');
      socket.broadcast.emit('userHasLoggedOut',  socket.userSession.getUserName());
      userSessions.destroySession(socket.userSession.getUserName());
    }
  });

  socket.on('sendMessage', function (data, ack) {

    socket.broadcast.emit('sendMessage', data);
    ack();
  });

  socket.on('getListOfUsers', function(data, ack) {
    console.log('getListOfUsers');
    ack( {
      success: true,
      data:  userSessions.getListOfUsers()
    });
  });

});

httpServer.listen(9001);

