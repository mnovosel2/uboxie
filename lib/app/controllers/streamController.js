var config = require('_/config'),
    Rdio = require('_/dependencies/rdio'),
    rdio = new Rdio(config.streamApiConfig),
    mongoose = require('mongoose'),
    mask = require('json-mask'),
    models = require('../models/index.js');

module.exports = {
    streamRoutes: function(app) {
        app.post('/api/1/getTracks', this.getTracks);
    },
    getTracks: function(req, res) {
    	var query=req.body.query;
        rdio.call('searchSuggestions', {
            'query': query,
            'types':['Track'] //dodat za artista
        }, function(err, content) {

            if(content){
            	if(content.status=="ok"){
                    if(req.body.limit){
                        var limitedData = { status: content.status, result: [] };

                        for(var i = 0; i<req.body.limit; i++){
                            limitedData.result.push(content.result[i]);
                        }

                        var masked = mask(limitedData, 
                            'status,result(key,name,artist,icon,album,duration)');

                        res.send(masked);

                    }else{
                        var masked = mask(content, 
                            'status,result(key,name,artist,icon,album,duration)');
                		res.send(masked);
                    }
            	}else if(content.status=="error"){
            		res.send(content);
            	}else{
            		res.send({
            			status:"unknown",
            			message:"Unknown error"
            		});
            	}
            }else{
                res.send({
                    status: 'unknown',
                    message: 'Unknown error'
                });
            }
        });
    }
};
