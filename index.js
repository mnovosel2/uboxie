var app = require('_/app'),
    mongoose = require('mongoose'),
    models = require('./lib/app/models/index.js'),
    async = require('async'),
    config = require('_/config'),
    socketController = require('_/app/'),
    io = require('socket.io'),
    server = require('http').createServer(app).listen(config.port),
    sio = io.listen(server);

var interval = setInterval(function(){

    models.active.find({ active: true }, function(err, activeGroups){
        console.log(activeGroups);

        for(var i = 0; i<activeGroups.length; i++){
            //console.log(activeGroups[i].id);
            //sio.sockets.in(activeGroups[i].id).emit('active', { id: activeGroups[i].id });
            
            var res = []
            , room = sio.sockets.adapter.rooms[activeGroups[i].id];
            if (room) {
                for (var id in room) {
                res.push(sio.sockets.adapter.nsp.connected[id]);
                }
            }

            if(room)
                console.log('People: ' + JSON.stringify(room));
            else
                console.log('No people!');
        }
    });

}, 1000);

sio.on('connection', function(socket) {
    console.log("Client connected");
    // sockets.initialize(socket,sio);
    socket.on('joinGroup', function(newGroupId, username) {
        console.log(newGroupId);
        console.log(username);
        socket.group = newGroupId;
        socket.username = username;
        socket.join(newGroupId);

        async.waterfall([
            function(callback){
                models.active.findOne({id: newGroupId, active: false}, function(err, active){
                    if(err){
                        callback(err);
                    } else if (active){
                        callback(null, active);
                    }
                });
            },
            function(activeGroup, callback){
                models.active.findByIdAndUpdate(activeGroup._id, { active: true }, function(err, updated){
                    if(err){
                        callback(err);
                    }
                });
            }
        ], function(error){
            console.log('Error seting activeGroup: ' + error);
        });

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
