module.exports={
	pageRoutes:function(app){
		// app.get('/',this.renderHomepage);
		app.get('/group/:id',this.renderGroupDetails);
	},
	renderHomepage:function(req,res,next){
		res.render('home/index');
	},
	renderGroupDetails:function(req,res,next){
		res.render('groups/details',{groupId:req.params.id});
	}
};