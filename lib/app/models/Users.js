var mongoose = require('mongoose'),
	userSchema = new mongoose.Schema({

		name: {
			type: String,
			required: true
		},
		surname: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		created: {
			type: Date,
			default: Date.now
		},
		updated: {
			type: Date,
			required: false
		},
		deleted: {
			type: Date,
			required: false,
			default: null
		}

	});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;