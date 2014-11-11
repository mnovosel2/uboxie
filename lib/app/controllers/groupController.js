var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js');

module.exports = {
	groupRoutes: function(app) {
		/************Views***************/
		app.get('/groups/new', this.newGroupPage);
		app.get('/groups/update/:groupId', this.updateGroupPage);
		/************Api*****************/
		app.get('/api/1/groups/find/:groupId?', this.findGroup); //forma za kreiranje
        app.post('/api/1/groups/new', this.addNewGroup);
        app.put('/api/1/groups/update', this.updateGroup); //forma za update
        app.delete('api/1/groups/delete/:groupId?', this.deleteGroup);
	},
	newGroupPage: function(req, res) {
		res.render('groups/new');
	},
	updateGroupPage: function(req, res) {
        models.music_group.find({ _id: req.params.groupId, deleted: null }, function(err, wantedGroup){

            if(err){
                console.log('error(updateGroupPage):' + err);
                res.status(400).end();
            }else
                //res.send(wantedGroup);
                res.render('groups/update', { id: req.params.groupId });
        });

		//res.render('groups/update');
	},
	findGroup: function(req, res) {
		if(req.params.groupId){
            models.music_group.find({ _id: req.params.groupId, deleted: null }, function(err, wantedGroup){

                if(err){
                    console.log('error(findGroup):' + err);
                    res.status(400).end();
                }else
                    res.send(wantedGroup);

            });
        }
        else{
            models.music_group.find({}, function(err, wantedGroups){

                if(err){
                    console.log('error(findGroup):' + err);
                    res.status(400).end();
                }else
                    res.send(wantedGroups);

            });
        }
	},
	addNewGroup: function(req, res) {
		if(req.body.groupName /*&& req.body.owner*/){
			//dodat uzimanje ownera
            new models.music_group({ name: req.body.groupName, owner: 'owner1' }).save(function(err, groupNew){
                if(err)
                    console.log('error(addNewGroup):' + err);
                else
                    console.log('new group: ' + groupNew);
                res.status(200).end();
            });

        }else
            res.status(400).end();
	},
	updateGroup: function(req, res) {
        console.log(req.body);
		if(req.body){
            var request = req.body;

            var data = {
                name: req.body.groupName,
                rating: req.body.rating,
                updated: Date.now()
            }

            if(request.id){
                models.music_group.findByIdAndUpdate(request.id, { $set: data }, function(err, musicGroup){

                    if(err)
                        console.log('error(updateGroup):' + err);
                    else
                        res.status(200).end();
                });
            }
            else
                res.status(400).end();
        }else
            res.status(400).end();
	},
	deleteGroup: function(req, res) {
		if(req.body.groupId){
            var request = req.body;

            var data = {
                deleted: Date.now
            }

            models.music_group.findByIdAndUpdate(request.groupId, { $set: data }, function(err, musicGroup){
                if(err)
                    console.log('error(updateGroup):' + err);
                else
                    res.status(200).end();
            });
        }
	}
};