var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    async = require('async'),
    _ = require('underscore'),
    userController = require('./userController');

module.exports = {
    groupRoutes: function(app) {
        /************Views***************/
        app.get('/', userController.isAuthenticated, this.allGroupsPage);
        app.get('/group/:id', userController.isAuthenticated, this.renderGroupDetails);
        app.get('/groups/new', userController.isAuthenticated, this.newGroupPage);
        app.get('/groups/update/:groupId', userController.isAuthenticated, this.updateGroupPage);
        /************Api*****************/
        app.get('/api/1/groups/find/:groupId?', this.findGroup);
        app.post('/api/1/groups/new', this.addNewGroup);
        app.put('/api/1/groups/update', this.updateGroup); //forma za update
        app.post('/api/1/group/:id/state/preserve', this.preserveState);
        app.post('/api/1/group/:id/state/current', this.saveCurrentSong);
        app.put('/api/1/group/:id/state/playtime', this.updateSongStartTime);
        app.put('/api/1/group/:id/state/songFinished', this.songFinished);
        app.get('/api/1/group/:id/fetch/current', this.fetchCurrentGroup);
        app.delete('api/1/groups/delete/:groupId?', this.deleteGroup);
    },
    renderGroupDetails: function(req, res, next) {
        res.render('groups/details', {
            groupId: req.params.id
        });
    },
    allGroupsPage: function(req, res) {
        models.music_group.find({}, function(err, allGroups) {
            if (err) {
                res.send({
                    status: false,
                    message: err
                });
            } else
                res.render('groups/all', {
                    groups: allGroups
                });
        });
    },
    newGroupPage: function(req, res) {
        res.render('groups/new');
    },
    updateGroupPage: function(req, res) {
        models.music_group.find({
            _id: req.params.groupId,
            deleted: null
        }, function(err, wantedGroup) {
            if (err) {
                res.send({
                    status: false,
                    message: err
                });
            } else
                res.render('groups/update', {
                    id: req.params.groupId
                });
        });
    },
    findGroup: function(req, res) {
        if (req.params.groupId) {
            models.music_group.find({
                _id: req.params.groupId,
                deleted: null
            }, function(err, wantedGroup) {
                if (err) {
                    res.send({
                        status: false,
                        message: err
                    });
                } else {
                    res.send({
                        status: true,
                        message: wantedGroup
                    });
                }
            });
        } else {
            models.music_group.find({}, function(err, wantedGroups) {
                if (err) {
                    res.send({
                        status: false,
                        message: err
                    });
                } else
                    res.send({
                        status: true,
                        message: wantedGroups
                    });
            });
        }
    },
    addNewGroup: function(req, res) {
        if (req.body.groupName) {
            //dodat uzimanje ownera
            new models.music_group({
                name: req.body.groupName,
                owner: 'owner1'
            }).save(function(err, groupNew) {
                if (err) {
                    res.send({
                        status: false,
                        err: err
                    });
                } else {
                    res.send({
                        status: true
                    });
                }
            });
        } else {
            res.send({
                status: false
            });
        }
    },
    updateGroup: function(req, res) {
        if (req.body) {
            var request = req.body;

            var data = {
                name: req.body.groupName,
                rating: req.body.rating,
                updated: Date.now()
            };
            if (request.id) {
                models.music_group.findByIdAndUpdate(request.id, {
                    $set: data
                }, function(err, musicGroup) {
                    if (err) {
                        res.send({
                            status: false,
                            message: err
                        });
                    } else {
                        res.send({
                            status: true,
                            message: musicGroup
                        });
                    }
                });
            } else {
                res.send({
                    status: false,
                    message: "Group update failed"
                });
            }
        } else {
            res.send({
                status: false,
                message: "Unknown group id"
            });
        }
    },
    deleteGroup: function(req, res) {
        if (req.body.groupId) {
            var request = req.body;

            var data = {
                deleted: Date.now
            };
            models.music_group.findByIdAndUpdate(request.groupId, {
                $set: data
            }, function(err, musicGroup) {
                if (err) {
                    res.send({
                        status: true,
                        message: err
                    });
                } else {
                    res.send({
                        status: true,
                        message: 'Group deleted'
                    });
                }
            });
        }
    },
    preserveState: function(req, res) {
        var groupId = req.params.id,
            key = req.body.key,
            duration = req.body.duration,
            name = req.body.name,
            startTime = req.body.startTime,
            info = req.body.info,
            icon = req.body.icon,
            artist = req.body.artist;
        models.music_group.findByIdAndUpdate(groupId, {
            $push: {
                songsInGroup: {
                    key: key,
                    duration: duration,
                    finished: false,
                    name: name,
                    startTime: startTime,
                    info: info,
                    icon: icon,
                    artist: artist
                }
            }
        }, function(err, musicGroup) {
            if (err) {
                res.send({
                    status: false,
                    message: err
                });
            } else {
                res.send({
                    status: true,
                    message: _.last(musicGroup.songsInGroup)
                });
            }
        });
    },
    saveCurrentSong: function(req, res) {
        var trackId = req.body.trackId,
            groupId = req.params.id;
        async.waterfall([
            function(callback) {
                models.music_group.find({
                    _id: groupId,
                }, function(err, musicGroup) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, musicGroup);
                    }
                });
            },
            function(musicGroup, callback) {
                var songsInGroup = musicGroup[0].songsInGroup,
                    trackToPlay = {};
                for (var i = 0; i < songsInGroup.length; i++) {
                    if (songsInGroup[i].finished == false && songsInGroup[i]._id == trackId) {
                        trackToPlay = songsInGroup[i];
                    }
                }
                callback(null, trackToPlay);
            },
            function(songInGroup, callback) {
                models.music_group.findByIdAndUpdate(groupId, {
                    currentSong: songInGroup
                }, function(err, currentSong) {
                    if (err) {
                        callback(err);
                    } else {
                        res.send({
                            status: true,
                            message: songInGroup
                        });
                    }
                });
            }
        ], function(err) {
            res.send({
                status: false,
                message: err
            });
        });

    },
    updateSongStartTime: function(req, res) {
        var trackId = req.body.trackId,
            startTime = req.body.startTime,
            groupId = req.params.id;
        async.waterfall([
            function(callback) {
                models.music_group.find({
                    _id: groupId,
                }, function(err, musicGroup) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, musicGroup);
                    }
                });
            },
            function(musicGroup, callback) {
                var songsInGroup = musicGroup[0].songsInGroup,
                    trackToPlay = null;
                for (var i = 0; i < songsInGroup.length; i++) {
                    if (songsInGroup[i].finished == false && songsInGroup[i]._id == trackId && songsInGroup[i].startTime == null) {
                        trackToPlay = songsInGroup[i];
                    }
                }
                if (trackToPlay) {
                    callback(null, trackToPlay);
                } else {
                    callback(null, null);
                }
            },
            function(track, callback) {
                if (track) {
                    track.startTime = startTime;
                    models.music_group.update({
                        _id: groupId,
                        "songsInGroup._id": trackId
                    }, {
                        "songsInGroup.$.startTime": startTime,
                    }, function(err, musicGroup) {
                        if (err) {
                            callback(err);
                        } else {
                            res.send({
                                status: true,
                                song: track
                            });
                        }
                    });
                } else {
                    res.send({
                        status: false,
                        message: "Track start time already updated"
                    });
                }
            }
        ], function(err) {
            res.send({
                status: false,
                message: err
            });
        });
    },
    fetchCurrentGroup: function(req, res) {
        var groupId = req.params.id;
        models.music_group.findById(groupId, function(err, musicGroup) {
            if (err) {
                res.send({
                    status: false,
                    message: err
                });
            } else {
                res.send({
                    status: true,
                    message: musicGroup
                });
            }
        });
    },
    songFinished: function(req, res) {
        var groupId = req.params.id,
            trackId = req.body.trackId;
        models.music_group.update({
            _id: groupId,
            "songsInGroup._id": trackId
        }, {
            "songsInGroup.$.finished": true,
            currentSong: {
                key: null,
                duration: 0,
                startTime: null,
                name: null,
                info: null,
                artist: null,
                icon: null,
                _id:null
            }
        }, function(err, musicGroup) {
            if (err) {
                res.send({
                    status: false,
                    message: err
                });
            } else {
                res.send({
                    status: true,
                    message: musicGroup
                });
            }
        });
    },
};
