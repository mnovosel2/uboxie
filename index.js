var app=require('_/app'),
	config=require('_/config'),
	socketController=require('_/app/'),
	io = require('socket.io'),
	server = require('http').createServer(app).listen(config.port),
	sio = io.listen(server),
	sockets=require('_/app/sockets')();
sio.on('connection', function(socket){ 
	console.log("Client connected");
	sockets.initialize(socket,sio);
});
module.exports=sio;