var socket = io.connect("http://localhost:3000");
var sensorData = {};

socket.on('heartbeat', function(data) {

  // console.log(data);
  sensorData = data.sensorData;
  createSensorView(data.markups);
  tuneIn2Broadcast();

});

function sendControlMsg(e) {
  
}

function createSensorView(markup) {

  var sensorsContainer = document.getElementById("sensors");
  sensorsContainer.innerHTML = markup;
}

function tuneIn2Broadcast(sensorData) {

}