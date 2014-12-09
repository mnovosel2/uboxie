
module.exports={
	homeRoutes:function(app){
		app.get('/test',this.renderHomepage);
	},
	renderHomepage:function(req,res,next){
		res.render('home/index');
	}
};