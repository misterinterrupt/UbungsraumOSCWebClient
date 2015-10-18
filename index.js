var osc = require('osc');
var Netmask = require('netmask').Netmask
var os = require('os');
var netmask = require('my-local-netmask')();
var networkIP = require('my-local-ip')();
'use strict';

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
var heartbeat = "/heartbeat";
var broadcast = new Netmask(networkIP + '/' + cidrFromMask(netmask)).broadcast;

var udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 7400
});
udpPort.on('message', function (msg) {
    if(msg.address === heartbeat) {
      console.log("An OSC message just arrived!", msg);
    }
});
udpPort.open();


