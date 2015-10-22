var socket = io.connect("http://localhost:3000");
var sensorData = {};


function onHeartbeat(data) {

  // console.log(data);
  sensorData = data.sensorData;
  if(data.markups !== null) {
    createSensorView(data.markups);
    bindCommands(data);
  }
  tuneIn2Broadcast();

}

function bindCommands() {
  var sensors = document.querySelectorAll('.sensor');
  var sendAllBtn = document.getElementById('sendAllBtn');

  sendAllBtn.addEventListener('click', sendAllControlMsgs);

  for (var i = 0; i < sensors.length; i++) {
    var sensor = sensors[i].querySelector('button');
    console.log('binding', sensor);
    sensor.addEventListener('click', function(e) {
      // sendControlMsg(e.target.parentNode);
      sendControlMsg(e.target.closest('.sensor'));
    });
  };
}

function sendAllControlMsgs() {

  var sensors = document.querySelectorAll('.sensor');
  for (var i = 0; i < sensors.length; i++) {
    sendControlMsg(sensors[i]);
  };
}

function sendControlMsg(sensorNode) {


  console.log('clicked ' + sensorNode.id);
  var ip = sensorNode.id;
  var minDepth = sensorNode.querySelector('minDepth');
  var maxDepth = sensorNode.querySelector('maxDepth');
  var minArea = sensorNode.querySelector('minArea');
  var blobDelta = sensorNode.querySelector('blobDelta');
  var params = {
    ip       : ip, 
    minDepth : minDepth, 
    maxDepth : maxDepth,
    minArea  : minArea,
    blobDelta: blobDelta
  };
  socket.emit('sensorConfigCommand', params);
}

function createSensorView(markup) {

  var sensorsContainer = document.getElementById("sensors");
  sensorsContainer.innerHTML = markup.join('');
}

function tuneIn2Broadcast(sensorData) {

}

socket.on('heartbeat', onHeartbeat);