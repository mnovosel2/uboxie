var mongoose = require('mongoose'),
    musicGroupSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        owner: {
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
        },
        rating: {
            type: Number,
            default: 0
        },
        currentSong: {
            _id:{
               type:mongoose.Schema.Types.ObjectId,
               default:null
            },
            key: {
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
            artist: {
                type: String,
                default: null
            }
        },
        songsInGroup: [{
            key: {
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
            artist: {
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
