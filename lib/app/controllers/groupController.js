var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    async = require('async'),
    request = require('request'),
    _ = require('underscore'),
    _ = require('underscore.object.plus'),
    userController = require('./userController');
/**
 * [Group controller module]
 * @type {Object}
 */
module.exports = {
    /**
     * [groupRoutes instantiates all routes for group handling]
     * @param  {Object} app [Main app instance]
     */
    groupRoutes: function(app) {
        /**
         * Routes for handling view rendering
         */
        app.get('/', userController.isAuthenticated, this.allGroupsPage);
        app.get('/group/:id', userController.isAuthenticated, this.renderGroupDetails);
        app.get('/groups/new', userController.isAuthenticated, this.newGroupPage);
        app.get('/groups/update/:groupId', userController.isAuthenticated, this.updateGroupPage);
        /**
         * Routes intended for public API
         */
        app.get('/api/1/groups/find/:groupId?', this.findGroup);
        app.post('/api/1/groups/new', this.addNewGroup);
        app.put('/api/1/groups/update', this.updateGroup);
        app.post('/api/1/group/:id/state/preserve', this.preserveState);
        app.post('/api/1/group/:id/state/current', this.saveCurrentSong);
        app.put('/api/1/group/:id/state/playtime', this.updateSongStartTime);
        app.put('/api/1/group/:id/state/songFinished', this.songFinished);
        app.get('/api/1/group/:id/fetch/current', this.fetchCurrentGroup);
        app.delete('api/1/groups/delete/:groupId?', this.deleteGroup);
    },
    /**
     * [renderGroupDetails displays content of the group (song queue, player, etc.)]
     * @param  {Object}   req  [Express request object]
     * @param  {Object}   res  [Express response object]
     * @param  {Function} next [Express function for calling next() middleware]
     */
    renderGroupDetails: function(req, res, next) {
        res.render('groups/details', {
            groupId: req.params.id
        });
    },
    /**
     * [allGroupsPage displays list of all active groups]
     * @param  {Object}   req  [Express request object]
     * @param  {Object}   res  [Express response object]
     */
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
    /**
     * [newGroupPage displays form for adding new group]
     * @param  {Object}   req  [Express request object]
     * @param  {Object}   res  [Express response object]
     */
    newGroupPage: function(req, res) {
        res.render('groups/new');
    },
    /**
     * [updateGroupPage displays form for editing an existing group]
     * @param  {Object}   req  [Express request object]
     * @param  {Object}   res  [Express response object]
     */
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
    /**
     * [findGroup return required data for group or list of groups]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Required data for groups]
     */
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
                var strippedGroupData = [],
                    strippedKeys = 'name,owner,_id';
                if (err) {
                    res.send({
                        status: false,
                        message: err
                    });
                } else {
                    for (var i = 0; i < wantedGroups.length; i++) {
                        strippedGroupData.push(_.pick(wantedGroups[i], {
                            name: 1,
                            _id: 1,
                            owner: 1,
                            currentSong: ['icon']
                        }));
                    }
                    res.send({
                        status: true,
                        message: strippedGroupData
                    });
                }
            });
        }
    },
    /**
     * [addNewGroup add new group over API]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Success or error response]
     */
    addNewGroup: function(req, res) {
        if (req.body.groupName) {

            var token = req.session.deezer.token;
            var groupName = req.body.groupName;

            async.waterfall([
                function(callback) {
                    request('http://localhost/api/1/user/current/' + req.session.deezer.token, function(err, res, body) {
                        if (err) {
                            callback(err);
                        } else {
                            var parsed = JSON.parse(body).message;
                            callback(null, parsed);
                        }
                    });
                },
                function(jsonData, callback) {
                    models.user.findOne({
                        id: jsonData.id
                    }, function(err, wantedUser) {
                        if (err) {
                            callback(err);
                        } else if (wantedUser == null) {
                            callback('Logged user not found!');
                        } else {
                            callback(null, wantedUser);
                        }
                    });
                },
                function(user, callback) {
                    new models.music_group({
                        name: groupName,
                        owner: {
                            id: user.id,
                            name: user.name,
                            lastname: user.lastname,
                            firstname: user.firstname,
                            birthday: user.birthday,
                            inscription_date: user.inscription_date,
                            gender: user.gender,
                            link: user.link,
                            picture: user.picture,
                            country: user.country,
                            lang: user.lang,
                            tracklist: user.tracklist,
                            type: user.type,
                            status: user.status
                        }
                    }).save(function(err, musicGroup) {
                        if (err) {
                            callback(err);
                        } else {
                            res.send({
                                status: true,
                                group: musicGroup
                            });
                        }

                    });
                }
            ], function(err) {
                res.send({
                    status: false,
                    err: err
                });
            });
        } else {
            res.send({
                status: false
            });
        }
    },
    /**
     * [updateGroup update group info over public API]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Success or error response]
     */
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
    /**
     * [delete delete group with requested ID over public API]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Success or error response]
     */
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
    /**
     * [preserveState save user selected song in database]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Error or new group state]
     */
    preserveState: function(req, res) {
        var groupId = req.params.id,
            songInGroup = req.body;
        songInGroup.finished = false;
        if (!songInGroup.info || !songInGroup.icon || !songInGroup.artist || !songInGroup.duration ||
            !songInGroup.key || !songInGroup.name) {
            return res.send({
                status: false,
                message: "Required data is missing"
            });
        }
        models.music_group.findByIdAndUpdate(groupId, {
            $push: {
                songsInGroup: songInGroup
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
    /**
     * [saveCurrentSong update currently playing song in database]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Error or current song info]
     */
    saveCurrentSong: function(req, res) {
        var trackId = req.body.trackId,
            groupId = req.params.id,
            startTime = req.body.startTime;
        async.waterfall([
            function(callback) {
                if (trackId && startTime) {
                    models.music_group.find({
                        _id: groupId,
                    }, function(err, musicGroup) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, musicGroup);
                        }
                    });
                } else {
                    callback('Required data missing');
                }
            },
            function(musicGroup, callback) {
                var songsInGroup = musicGroup[0].songsInGroup,
                    trackToPlay = null;
                for (var i = 0; i < songsInGroup.length; i++) {
                    if (songsInGroup[i].finished === false && songsInGroup[i]._id == trackId) {
                        trackToPlay = songsInGroup[i];
                    }
                }
                if (trackToPlay) {
                    callback(null, trackToPlay);
                } else {
                    callback('No valid track found');
                }

            },
            function(track, callback) {
                if (track.startTime===null) {
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
                            callback(null,track);
                        }
                    });
                } else {
                    res.send({
                        status: false,
                        message: "Track start time already updated"
                    });
                }
            },
            function(songInGroup, callback) {
                console.log('songInGroup');
                console.log(songInGroup);
                songInGroup.startTime = startTime;
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
    /**
     * [updateSongStartTime set start time of current song]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Error or updated track info]
     */
    updateSongStartTime: function(req, res) {
        var trackId = req.body.trackId,
            startTime = req.body.startTime,
            groupId = req.params.id;
        console.log('SERVER UPDATA STARTTIME');
        console.log(trackId + '---' + startTime + '----' + groupId);
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
                var songsInGroup = null,
                    trackToPlay = null;
                console.log(musicGroup);
                if (!musicGroup[0]) {
                    callback('Music group is undefined');
                } else {
                    songsInGroup = musicGroup[0].songsInGroup,
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
    /**
     * [fetchCurrentSong get info about currently playing song]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Error or current song object]
     */
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
    /**
     * [songFinished update group info over public API]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     * @return {Object}     [Error or new group state]
     */
    songFinished: function(req, res) {
        var groupId = req.params.id,
            trackId = req.body.trackId;
        async.waterfall([
            function(callback) {
                models.music_group.find({
                    _id: groupId,
                    "songsInGroup._id": trackId
                }, function(err, musicGroup) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, musicGroup);
                    }
                });
            },
            function(musicGroup, callback) {
                if (musicGroup) {
                    models.music_group.update({
                        _id: groupId,
                        "songsInGroup._id": trackId
                    }, {
                        "songsInGroup.$.finished": true,
                    }, function(err, numOfGroupsUpdated) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, musicGroup);
                        }
                    });
                } else {
                    callback('Music group not defined');
                }
            },
            function(musicGroup, callback) {
                var lastSongInGroup = null;
                console.log('Music group');
                console.log(musicGroup);
                if (musicGroup) {
                    lastSongInGroup = _.last(musicGroup[0].songsInGroup);
                    console.log('lastSong');
                    console.log(lastSongInGroup);
                    if (lastSongInGroup) {
                        if (lastSongInGroup._id == trackId) {
                            models.music_group.update({
                                _id: groupId,
                                "songsInGroup._id": trackId
                            }, {
                                currentSong: {
                                    key: null,
                                    duration: 0,
                                    startTime: null,
                                    name: null,
                                    info: null,
                                    artist: null,
                                    icon: null,
                                    _id: null
                                }
                            }, function(err, musicGroup) {
                                if (err) {
                                    callback(err);
                                } else {
                                    res.send({
                                        status: true,
                                        message: musicGroup
                                    });
                                }
                            });
                        } else {
                            res.send({
                                status: true,
                                message: musicGroup
                            });
                        }
                    } else {
                        res.send({
                            status: false,
                            message: 'Last song in group not found'
                        });
                    }
                } else {
                    callback('Music group not defined');
                }
            }
        ], function(err) {
            res.send({
                status: false,
                message: err
            });
        });
    },
};
