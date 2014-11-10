var express = require('express'),
	config=require('_/config');
	app = express(),
	mongoose = require('mongoose'),
	cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
	pageController=require('./controllers/pageController'),
	streamController=require('./controllers/streamController'),
	groupController=require('./controllers/groupController.js');

mongoose.set('debug, true'),
mongoose.connect(config.dbConnection, {
        server: {
            socketOptions: {
        	keepAlive: 1
    	}
	}
});

app.set('views',config.views);
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.public));
pageController.pageRoutes(app);
streamController.streamRoutes(app);
groupController.groupRoutes(app);
module.exports = app;