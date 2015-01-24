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
		}
	};
});
