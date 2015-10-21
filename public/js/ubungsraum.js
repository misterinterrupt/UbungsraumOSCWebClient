var socket = io.connect("http://localhost:3000");
var sensorData = {};

socket.on('heartbeat', function(data) {

  // console.log(data);
  sensorData = data.sensorData;
  if(data.markups !== null) {
    createSensorView(data.markups);
    bindCommands(data);
  }

  tuneIn2Broadcast();

});

function bindCommands() {
  
}

function sendControlMsg(e) {
  
}

function createSensorView(markup) {

  var sensorsContainer = document.getElementById("sensors");
  sensorsContainer.innerHTML = markup;
}

function tuneIn2Broadcast(sensorData) {

}