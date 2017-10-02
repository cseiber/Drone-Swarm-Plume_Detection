var net = require('net');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gps2;
var file = '/dev/ttyS2';

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	socket.pipe(socket);
});

server.on('connection', handleGPS2);

server.listen(8000, function() {  
  console.log('server listening to %j', server.address());
});

function handleGPS2(conn) {  
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
    gps2 = JSON.parse(d);
    io.emit('position2', gps2);
    //console.log('connection data from %s: %s', remoteAddress);
    console.log('Latitude: %d', gps2.lat);
    console.log('Longitude: %d', gps2.lon);
    console.log('Altitude: %d', gps2.alt);
    //conn.write(d);
  }

  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }

  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
}

var SerialPort = require('serialport');
var port = new SerialPort.SerialPort(file, {
  baudrate: 9600,
  parser: SerialPort.parsers.readline('\r\n')
});

var GPS = require('../../gps.js');
var gps = new GPS;

gps.on('GGA', function(data) {
  io.emit('position', data);
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/maps2.html');
});

http.listen(1000, function() {

  console.log('listening on *:1000');
});

port.on('data', function(data) {
  gps.update(data);
});
