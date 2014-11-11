var express = require('express'),
	config=require('_/config');
	app = express(),
	mongoose = require('mongoose'),
	cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
	pageController=require('./controllers/pageController'),
	streamController=require('./controllers/streamController'),
	groupController=require('./controllers/groupController.js');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));
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