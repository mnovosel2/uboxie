var express = require('express'),
    config = require('_/config'),
    app = express(),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    models = require('./models/index.js'),
    streamController = require('./controllers/streamController'),
    groupController = require('./controllers/groupController'),
    userController = require('./controllers/userController');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
mongoose.set('debug, true');
mongoose.connect(config.dbConnection, {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
});
app.set('views', config.views);
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(config.public));
app.use(cookieParser(config.cookieSecret));
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.cookieSecret
}));
streamController.streamRoutes(app);
groupController.groupRoutes(app);
userController.userRoutes(app);
module.exports = app;
