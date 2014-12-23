module.exports={
	initialize:function(socket,sio){
		socket.on('songAdded',this.addSongInList);
		socket.on('songChanged',this.testChEvent);
	},
	addSongInList:function(track){
		console.log('THe boss');
		console.log(track);
	},
	testChEvent:function(msg2){
		console.log('Changed');
		console.log(msg2);
	}
};