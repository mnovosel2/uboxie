var app = require('_/app'),
    config = require('_/config'),
    socketController = require('_/app/'),
    io = require('socket.io'),
    server = require('http').createServer(app).listen(config.port),
    sio = io.listen(server);
sio.on('connection', function(socket) {
    console.log("Client connected");
    // sockets.initialize(socket,sio);
    socket.on('joinGroup', function(newGroupId, username) {
        console.log(newGroupId);
        console.log(username);
        socket.group = newGroupId;
        socket.username = username;
        socket.join(newGroupId);
    });
    socket.on('songAdded', function(track) {
        console.log('Track');
        console.log(socket.group);
        if (typeof track == "string") {
            track = JSON.parse(track);
        }
        for (var socketId in sio.nsps['/'].adapter.rooms[socket.group]) {
            console.log('SOCKET IDs');
            console.log(socketId);
        }
        sio.sockets.in(socket.group).emit('updateGroupQueue', track);
    });
    socket.on('addGroup', function(groupData) {
        /*console.log('Data: ' + JSON.stringify(groupData));
			var parsedData=JSON.stringify(groupData).replace(/\\/g, '');
			console.log('Data parsed ' + parsedData);*/
        console.log(groupData);
        sio.emit('newGroup', groupData);
    });
    socket.on('disconnect', function() {
        console.log('Disconnect');
        console.log(socket.username);
        console.log(socket.group);
        socket.leave(socket.group);
    });
});
module.exports = sio;
