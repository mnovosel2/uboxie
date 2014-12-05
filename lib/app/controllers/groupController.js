var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js');

module.exports = {
    groupRoutes: function(app) {
        /************Views***************/
        app.get('/', this.allGroupsPage);
        app.get('/groups/new', this.newGroupPage);
        app.get('/groups/update/:groupId', this.updateGroupPage);
        /************Api*****************/
        app.get('/api/1/groups/find/:groupId?', this.findGroup);
        app.post('/api/1/groups/new', this.addNewGroup);
        app.put('/api/1/groups/update', this.updateGroup); //forma za update
        app.post('/api/1/group/:id/state/preserve', this.preserveState);
        app.post('/api/1/group/:id/state/current', this.saveCurrentSong);
        app.put('/api/1/group/:id/state/playtime', this.updateCurrentPlaytime);
        app.put('/api/1/group/:id/state/songFinished', this.songFinished);
        app.get('/api/1/group/:id/fetch/current', this.fetchCurrentGroup);
        app.delete('api/1/groups/delete/:groupId?', this.deleteGroup);
    },
    allGroupsPage: function(req, res) {
        models.music_group.find({}, function(err, allGroups) {
            if (err) {
                console.log('error(allGroupsPage)');
                res.status(400).end();
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
                console.log('error(updateGroupPage):' + err);
                res.status(400).end();
            } else
            //res.send(wantedGroup);
                res.render('groups/update', {
                id: req.params.groupId
            });
        });

        //res.render('groups/update');
    },
    findGroup: function(req, res) {
        if (req.params.groupId) {
            models.music_group.find({
                _id: req.params.groupId,
                deleted: null
            }, function(err, wantedGroup) {

                if (err) {
                    console.log('error(findGroup):' + err);
                    res.status(400).end();
                } else
                    res.send(wantedGroup);

            });
        } else {
            models.music_group.find({}, function(err, wantedGroups) {

                if (err) {
                    console.log('error(findGroup):' + err);
                    res.status(400).end();
                } else
                    res.send(wantedGroups);

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
        console.log(req.body);
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

                    if (err)
                        console.log('error(updateGroup):' + err);
                    else
                        res.send({
                            status: true
                        });
                });
            } else {

                res.send({
                    status: false
                });
            }
        } else
            res.status(400).end();
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
                if (err)
                    console.log('error(updateGroup):' + err);
                else
                    res.send({
                        status: true
                    });
            });
        }
    },
    preserveState: function(req, res) {
        var groupId = req.params.id,
            trackKey = req.body.trackKey,
            duration = req.body.duration,
            title = req.body.title,
            startTime = req.body.startTime;
        console.log(startTime);
        models.music_group.findByIdAndUpdate(groupId, {

            $push: {
                songsInGroup: {
                    trackKey: trackKey,
                    duration: duration,
                    finished: false,
                    title: title,
                    startTime: startTime
                }
            }
        }, function(err, musicGroup) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    status: true
                });
            }
        });
    },
    saveCurrentSong: function(req, res) {
        var trackKey = req.body.trackId,
            duration = req.body.duration,
            currentPlayTime = req.body.currentPlayTime,
            title = req.body.title,
            groupId = req.params.id;
        models.music_group.findByIdAndUpdate(groupId, {
            currentSong: {
                currentPlayTime: currentPlayTime,
                duration: duration,
                trackKey: trackKey,
                title: title
            }
        }, function(err, musicGroup) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    status: true
                });
            }
        });
    },
    updateCurrentPlaytime: function(req, res) {
        var trackKey = req.body.trackId,
            currentPlayTime = req.body.currentPlayTime,
            groupId = req.params.id;
        models.music_group.findByIdAndUpdate(groupId, {
            'currentSong.currentPlayTime': currentPlayTime
        }, function(err, musicGroup) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    status: true
                });
            }
        });
    },
    fetchCurrentGroup: function(req, res) {
        var groupId = req.params.id;
        models.music_group.findById(groupId, function(err, musicGroup) {
            if (err) {
                res.send(err);
            } else {
                res.send(musicGroup);
            }
        });
    },
    songFinished: function(req, res) {
        var groupId = req.params.id,
            trackKey = req.body.trackKey;
        models.music_group.update({
            _id: groupId,
            "songsInGroup.trackKey": trackKey
        }, {
            "songsInGroup.$.finished": true,
            currentSong: {
                trackKey: null,
                duration: 0,
                currentPlayTime: 0
            }
        }, function(err, musicGroup) {
            if (err) {
                res.send(err);
            } else {
                res.send({
                    status: true
                });
            }
        });
    },
};
