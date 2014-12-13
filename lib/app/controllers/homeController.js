
module.exports={
	homeRoutes:function(app){
		app.get('/channel',this.renderChannelPage);
	},
	renderChannelPage:function(req,res,next){
		res.render('default/channel');
	}
};