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
        currentSong: {
            trackKey: {
                type: String,
                default: null
            },
            duration: {
                type: Number,
                default: 0
            },
            startTime: {
                type: Date,
                default: null
            },
            name: {
                type: String,
                default: null
            },
            info: {
                type: String,
                default: null
            },
            icon: {
                type: String,
                default: null
            },
            author: {
                type: String,
                default: null
            }
        },
        songsInGroup: [{
            trackKey: {
                type: String,
                default: null
            },
            duration: {
                type: Number,
                default: 0
            },
            finished: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                default: null
            },
            startTime: {
                type: Date,
                default: null
            },
            info: {
                type: String,
                default: null
            },
            icon: {
                type: String,
                default: null
            },
            author: {
                type: String,
                default: null
            }
        }],
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
