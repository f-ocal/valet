// Socket.io client boilerplate
var socket = require('socket.io-client')(process.env.PARKING_SPOT1 || 'http://localhost');
socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});
