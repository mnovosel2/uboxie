var express = require('express'),
	config=require('_/config');
	app = express(),
	homeController=require('./controllers/homeController');
app.set('views',config.views);
app.set('view engine', 'jade');
app.use(express.static(config.public));
homeController.homeRoutes(app);
module.exports = app;