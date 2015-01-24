var models = require('../models/index.js');
module.exports=(function(){
	var socketPrivate,
		sioPrivate;
	return{
		initialize:function(socket,sio){
			socketPrivate=socket;
			sioPrivate=sio;
			socket.on('joinGroup',this.joinGroup);
			socket.on('songAdded',this.songAdded);
			socket.on('addGroup', this.addGroup);
		},
		joinGroup:function(newGroupId,username){
			socketPrivate.group=newGroupId;
			socketPrivate.username=username;
			socketPrivate.join(newGroupId);
		},
		songAdded:function(track){
			console.log('Track');
			console.log(socketPrivate.group);
			console.log(track);
			sioPrivate.to(socketPrivate.group).emit('updateGroupQueue',track);
		},
		addGroup:function(data){
			console.log('Data: ' + data.random);
			sioPrivate.emit('newGroup', data.random);
		}
	};
});
