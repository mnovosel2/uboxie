var app=require('_/app'),
	config=require('_/config');
var io = require('socket.io');
var server = require('http').createServer(app).listen(config.port);
var sio = io.listen(server);
sio.on('connection', function(client){ 
	console.log(client);
});
module.exports=sio;