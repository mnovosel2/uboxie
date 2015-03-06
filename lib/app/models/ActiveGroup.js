var mongoose = require('mongoose'),
	activeGroupSchema = new mongoose.Schema({
		id:{
			type: String,
			required: true
		},
		active:{
			type: Boolean,
			required: true,
			default: false
		}
	});

var activeGroupModel = mongoose.model('active_group', activeGroupSchema);

module.exports = activeGroupModel;