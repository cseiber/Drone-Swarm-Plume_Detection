var net = require('net');
//var HOST = '192.168.50.14';
var HOST = '172.20.10.9';
var PORT = 8004;
var GASPORT = 9004;
var file = '/dev/ttyS2';
var ArduinoFirmata = require('arduino-firmata');
var arduino = new ArduinoFirmata();
var SerialPort = require('serialport');

var port = new SerialPort.SerialPort(file, {
  baudrate: 9600,
  parser: SerialPort.parsers.readline('\r\n')
});

arduino.connect('/dev/ttyS0');
console.log("connecting to MCU"); 

arduino.on('connect', function(){
  console.log("connection established!"); 
  console.log("board version: v"+arduino.boardVersion);
 
});

var GPS = require('../../gps.js');
var gps = new GPS;


//var gpsData = gps.state
var client = new net.Socket();
var gasClient = new net.Socket();

client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    //client.write('Hello!');
});

gasClient.connect(GASPORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + GASPORT);
});

arduino.on('analogChange', function(e){
  if (e.pin === 1)
    gasClient.write(JSON.stringify(e.value)); 
});

gps.on('GGA', function(data) {
    client.write(JSON.stringify(data));
});
    
port.on('data', function(data) {
    gps.update(data);
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});

gasClient.on('close', function() {
    console.log('Gas Connection closed');
});
