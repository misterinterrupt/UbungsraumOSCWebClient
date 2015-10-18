var express = require('express');
var app = express();
var http = require('http').Server(app);
var jade = require('jade');
var io = require('socket.io')(http);
var osc = require('osc');
var os = require('os');
var Netmask = require('netmask').Netmask
var networkMask = require('my-local-netmask')();
var networkIP = require('my-local-ip')();
'use strict';


// utils

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function cidrFromMask(mask) {
  var cidr = 0;
  var parts = mask.split('.');
  for (var i = 0; i < parts.length; i++) {
    cidr += dec2bin(parseInt(parts[i], 10)).replace(/[^1]/g, "").length;
  };
  return cidr;
}


// osc server

var initOSC = function() {
  var heartbeat = "/heartbeat";
  var broadcast = new Netmask(networkIP + '/' + cidrFromMask(networkMask)).broadcast;

  var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7400
  });
  udpPort.on('message', function (msg) {

      if(msg.address === heartbeat) {
        console.log("An /heartbeat message just arrived!", msg);
        io.sockets.emit('heartbeat', msg);
      }
  });
  udpPort.open();
}

// webserver

app.use(express.static('public'));
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){

  res.render('layout', {});
});

var oscServer = io.listen(http);

oscServer.on('connection', function(socket){

  console.log('a user connected');
  initOSC();
});

app.listen(3000, function(){

  console.log('listening on *:3000');
});
