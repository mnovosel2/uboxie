var config = require('_/config'),
    Rdio = require('_/dependencies/rdio'),
    rdio = new Rdio(config.streamApiConfig),
    mongoose = require('mongoose'),
    mask = require('json-mask'),
    models = require('../models/index.js');

module.exports = {
    streamRoutes: function(app) {
        app.get('/api/1/groups/find/:groupId?', this.findGroup);
        app.post('/api/1/groups/new', this.addNewGroup);
        app.put('/api/1/groups/update', this.updateGroup);
        app.post('/api/1/getTracks', this.getTracks);
    },
    getTracks: function(req, res) {
    	var query=req.body.query;
        rdio.call('searchSuggestions', {
            'query': query,
            'types':['Track']
        }, function(err, content) {

        	if(content.status=="ok"){

                var masked = mask(content, 
                    'result(key,name,artist,icon,album)');
        		res.send(masked);
        	}else if(content.status=="error"){
        		res.send(content);
        	}else{
        		res.send({
        			status:"unknown",
        			message:"Unknown error"
        		});
        	}
        });
    },
    findGroup: function(req, res){

        if(req.params.groupId){
            models.music_group.find({ _id: req.params.groupId }, function(err, wantedGroup){

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
    addNewGroup: function(req, res){

        if(req.body.name && req.body.owner){

            new models.music_group({ name: req.body.name, owner: req.body.owner }).save(function(err, groupNew){
                if(err)
                    console.log('error(addNewGroup):' + err);
                else
                    console.log('new group: ' + groupNew);
                res.status(200).end();
            });

        }else
            res.status(400).end();

    },
    updateGroup: function(req, res){

        if(req.body){

            var request = req.body;

            var data = {

                name: req.body.name,
                rating: req.body.rating,
                updated: Date.now

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

    }
};
