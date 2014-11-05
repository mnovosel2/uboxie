var express = require('express'),
	config=require('_/config');
	app = express(),
	cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
	pageController=require('./controllers/pageController'),
	streamController=require('./controllers/streamController');
app.set('views',config.views);
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.public));
pageController.pageRoutes(app);
streamController.streamRoutes(app);
module.exports = app;