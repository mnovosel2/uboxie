var mongoose = require('mongoose'),
	userSchema = new mongoose.Schema({
		id:{
			type:String,
			required:true
		},
		name: {
			type: String,
			required: true
		},
		lastname: {
			type: String,
			required: true
		},
		firstname: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		status: {
			type: Number, 
		}

	});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;