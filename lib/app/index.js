var express = require('express'),
    config = require('_/config');
    app = express(),
    mongoose = require('mongoose'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    models = require('./models/index.js'),
    pageController = require('./controllers/pageController'),
    streamController = require('./controllers/streamController'),
    groupController = require('./controllers/groupController.js'),
    userController = require('./controllers/userController.js');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride(function(req, res) {
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
passport.use(new localStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        models.user.findOne({
            email: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            /*if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }*/
            return done(null, user);
        });
    }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
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
    secret:config.cookieSecret
}));
// app.use(passport.initialize());
//app.use(passport.session());
pageController.pageRoutes(app);
streamController.streamRoutes(app);
groupController.groupRoutes(app);
userController.userRoutes(app);
module.exports = app;
