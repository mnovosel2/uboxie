var config = require('_/config'),
    Rdio = require('_/dependencies/rdio'),
    rdio = new Rdio(config.streamApiConfig);
module.exports = {
    streamRoutes: function(app) {
        app.post('/api/1/getTracks', this.getTracks);
    },
    getTracks: function(req, res) {
    	var query=req.body.query;
        rdio.call('searchSuggestions', {
            'query': query,
            'types':['Track']
        }, function(err, content) {
        	if(content.status=="ok"){
        		res.send(content);
        	}else if(content.status=="error"){
        		res.send(content);
        	}else{
        		res.send({
        			status:"unknown",
        			message:"Unknown error"
        		});
        	}
        });
    }
};
