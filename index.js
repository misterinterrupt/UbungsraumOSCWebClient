var fs = require('fs');
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


// vars
var oscServer; // osc server instance 
var sensors = {};
var sensorTTLTimeoutId;
var oscServerAddress = '0.0.0.0';
var oscServerPort = 7400;
var oscClientPort = 7401;

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

function addSensor(msg) {

  var changed = false;
  var params = Array.prototype.slice.call(msg.args, 1);
  var ip = msg.args[0];
  if(typeof sensors[ip] === 'undefined') {
    // ip is not in sensors
    changed = true;
  }
  var lastUpdated = new Date();
  sensor = {
    ip: ip,
    minDepth: params[0],
    maxDepth: params[1],
    minArea: params[2],
    blobDelta: params[3],
    ttl: lastUpdated
  }
  sensors[ip] = sensor;
  if(changed) {
    // console.log(ip + ' added');
    var sensorMarkups = buildSensorTemplates();
    io.emit('heartbeat', { markups: sensorMarkups, sensorData: sensors });
  } else {
    // console.log(ip + ' updated');
    io.emit('heartbeat', { markups: null, sensorData: sensors });
  }
}

function buildSensorTemplates() {

  var sensorTmpl = jade.compile(fs.readFileSync("server/views/sensor.jade"));
  var markups = [];
  for (var key in sensors) {
    markups.push(sensorTmpl(sensors[key]));
  }
  return markups;
}

function sendRemoteCommand(params) {

  var msgArgs = [];
  var oscPort, ip, msg;
  
  for (var key in params) {
    if(key === 'ip') {
      ip = params[key];
    } else {
      msgArgs.push({
        type:'i',
        value: parseInt(params[key])
      });
    }
  }
  if(!sensors[ip]) {
    return;
  }
  
  // oscPort = new osc.UDPPort({
  //   localAddress: networkIP,
  //   remoteAddress: ip,
  //   remotePort: oscClientPort
  // });

  // oscPort.open();
  msg = {
    address: '/config',
    args: msgArgs
  };
  // console.log(msgArgs);
  // oscPort.send(msg);
  // oscPort.close();
  oscServer.send(msg, ip, oscClientPort);
  sensors[ip].changed = true;
}

// osc server
// . . |. . . . ; . then + 7s continues forward as hartbeats are updated -->
// . .  . . . . . . now

var initOSC = function() {

  var heartbeat = "/heartbeat";
  var broadcast = new Netmask(networkIP + '/' + cidrFromMask(networkMask)).broadcast;

  sensorTTLTimeoutId = setInterval(function() {

    var changed = false;
    for (var key in sensors) {
      if( ((sensors[key].ttl.getSeconds() + 7) - new Date().getSeconds() <= 0)
        || (sensors[key].changed === true)) {
        delete sensors[key];
        changed = true;
      }
    }
    if(changed) {
      io.emit('heartbeat', { markups: null, sensorData: sensors });
    }

  }, 500);

  oscServer = new osc.UDPPort({
    localAddress: oscServerAddress,
    localPort: oscServerPort
  });

  console.log('osc server listening at ' + oscServerAddress + ':' + oscServerPort);
  // console.log(oscServer);

  oscServer.on('message', function (msg) {

      if(msg.address === heartbeat) {
        addSensor(msg);
        // console.log("receieved a /heartbeat message", msg);
      }
  });

  oscServer.open();
};

var tearDownOSC = function() {
    sensors = [];
    oscServer.close();
};

// webserver

app.use(express.static('public'));
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){

  res.render('index', {});
});

io.on('connection', function(socket){

  console.log('user connected');
  initOSC();
  socket.on('disconnect', function(){
    console.log('user disconnected.');
    tearDownOSC();
    console.log('OSC closed at ' + oscServer.localAddress + ':' + oscServer.localPort);
  });
  socket.on('sensorConfigCommand', sendRemoteCommand);
});


http.listen(1337, function(){

  console.log('express listening for http on local:1337');
});
