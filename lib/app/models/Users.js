var mongoose = require('mongoose'),
	userSchema = new mongoose.Schema({
		id:{
			type: Number,
			required:true
		},
		name: {
			type: String,
			required: true
		},
		lastname: {
			type: String,
			required: false
		},
		firstname: {
			type: String,
			required: false
		},
		birthday: {
			type: String,
			required: true
		},
		inscription_date: {
			type: String,
			required: true
		},
		gender: {
			type: String,
			required: true
		},
		link: {
			type: String,
			required: true
		},
		picture: {
			type: String,
			required: true
		},
		country: {
			type: String,
			required: true
		},
		lang: {
			type: String,
			required: true
		},
		tracklist: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		},
		status: {
			type: Number,
			required: true 
		}

	});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;