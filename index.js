var app = require('_/app'),
    mongoose = require('mongoose'),
    models = require('./lib/app/models/index.js'),
    async = require('async'),
    config = require('_/config'),
    socketController = require('_/app/'),
    io = require('socket.io'),
    _ = require('underscore'),
    _ = require('underscore.object.plus'),
    server = require('http').createServer(app).listen(config.port),
    sio = io.listen(server);

var counter = 0;
var interval = setInterval(function(){
    async.waterfall([
        function(callback){
            models.active.find({ active: true }, function(err, activeGroups){
                if(err){
                    callback(err);
                } else if (activeGroups.length === 0){
                    //do nothing
                } else {
                    callback(null, activeGroups);
                }
            });
        },
        function(groups, callback){
            var counted = false;
            for(var i = 0; i<groups.length; i++){
                var res = []
                , room = sio.sockets.adapter.rooms[groups[i].id];
                if (room) {
                    for (var id in room) {
                        res.push(sio.sockets.adapter.nsp.connected[id]);
                    }
                }
                /*if(res.length > 0){
                    counter -= 1;
                }*/
                else{
                    if(!counted)
                        counter += 1;
                    counted = true;
                    if(counter === 5){
                        counter = 0;
                        callback(null, groups);
                    }
                }
            }

            console.log('counter: ' + counter);
        },
        function(groupsToRemove, callback){
            for(var i = 0; i<groupsToRemove.length; i++){
                models.music_group.findOne({ _id: groupsToRemove[i].id }).remove().exec();
                models.active.findOne({ _id: groupsToRemove[i]._id }).remove().exec();
                sio.emit('removeGroup', { id: groupsToRemove[i].id });
            }
        }
    ], function(err){
        console.log(err);
    });
}, 2000);

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
