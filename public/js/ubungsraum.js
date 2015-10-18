var socket = io.connect("http://localhost:3000");
socket.on('heartbeat', function(msg) {
  console.log(msg);
  createHeartbeatView(msg);
});

function createSensorView(data) {
   var frag = document.createDocumentFragment();
   sensor = frag.appendChild(document.createElement("div"));
   sensor.innerHTML = data.sensor.html;
   var sensorsContainers = document.getElementById("sensors");
   sensorsContainers.prependChild(sensor);
}