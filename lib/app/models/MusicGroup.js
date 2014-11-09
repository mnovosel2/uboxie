var mongoose = require('mongoose'),
	musicGroupSchema = new mongoose.Schema({

		name: {
			type: String,
			required: true
		},
		owner: {
			type: String,
			required: true
		},
		rating: {
			type: Number,
			default: 0
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

var groupModel = mongoose.model('music_group', musicGroupSchema);

module.exports = groupModel;