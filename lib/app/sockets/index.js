var models = require('../models/index.js');
module.exports = (function() {
    var socketPrivate,
        sioPrivate;
    return {
        initialize: function(socket, sio) {
            socketPrivate = socket;
            sioPrivate = sio;
            socket.on('joinGroup', this.joinGroup);
            socket.on('songAdded', this.songAdded);
            socket.on('addGroup', this.addGroup);
        },
        joinGroup: function(newGroupId, username) {
            console.log(newGroupId);
            console.log(username);
            socketPrivate.group = newGroupId;
            socketPrivate.username = username;
            socketPrivate.join(newGroupId);
        },
        songAdded: function(track) {
            console.log('Track');
            console.log(socketPrivate.group);
            if (typeof track == "string") {
                track = JSON.parse(track);
            }
            for (var socketId in sioPrivate.nsps['/'].adapter.rooms[socketPrivate.group]) {
                console.log('SOCKET IDs');
                console.log(socketId);
            }
            sioPrivate.sockets.in(socketPrivate.group).emit('updateGroupQueue', track);
        },
        addGroup: function(groupData) {
            /*console.log('Data: ' + JSON.stringify(groupData));
			var parsedData=JSON.stringify(groupData).replace(/\\/g, '');
			console.log('Data parsed ' + parsedData);*/
            console.log(groupData);
            sioPrivate.emit('newGroup', groupData);
        }
    };
});
