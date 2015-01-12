module.exports={
	/**
	 * [homeRoutes Deezer redirection route used for providing music]
	 * @param  {Object} app [Express app object]
	 */
	homeRoutes:function(app){
		app.get('/channel',this.renderChannelPage);
	},
	/**
	 * [renderChannelPage displays music provider's JavaScript SDK]
	 * @param  {Object}   req  [Express request object]
	 * @param  {Object}   res  [Express response object]
	 * @param  {Function} next [Express function for calling next() middleware]
	 */
	renderChannelPage:function(req,res,next){
		res.render('default/channel');
	}
};