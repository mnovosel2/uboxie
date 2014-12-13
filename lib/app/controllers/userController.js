var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    DZ = require('node-deezer'),
    deezer = new DZ();
module.exports = {

    userRoutes: function(app) {
        app.get('/login', this.userLogin);
        app.get('/loginCallback', this.loginCallback);
        app.get('/api/1/user/current', this.getCurrentUser);
        app.get('/user/logout', this.userLogout);
    },
    userLogin: function(req, res) {
        var callbackUrl = 'http://uboxie.me/loginCallback',
            permissions = ['basic_access'],
            appId = config.streamApiConfig[0],
            authLink = deezer.getLoginUrl(appId, callbackUrl, permissions);

        res.render('users/login', {
            authLink: authLink
        });
    },
    loginCallback: function(req, res) {
        var code = req.param('code'),
            appId = config.streamApiConfig[0],
            appSecret = config.streamApiConfig[1],
            err = null;

        if (!code) {
            err = req.param('error_reason');
            if (err === 'user_denied') {
                return res.redirect('/login');
            }
            if (!err) {
                return next(
                    'Deezer encountered an unknown error when ' +
                    'logging in the specified user :: ' + req.body
                );
            }
            return next(
                'Deezer encountered an unknown error :: ' + err
            );
        }
        deezer.createSession(appId, appSecret, code, function(err, result) {
            if (err) return next(err);
            req.session.deezer = {
                lifespan: result.expires,
                token: result.accessToken,
                lastLogin: new Date()
            };
            res.redirect('/');
        });
    },
    getCurrentUser: function(req, res) {

    },
    isAuthenticated: function(req, res, next) {
        var lastLogin,
            msElapsed,
            secondsElapsed,
            secondsRemaining,
            refreshThreshold;

        console.log('Checking Deezer token...', req.session.deezer);
        if (!req.session.deezer) {
            return res.redirect('/login');
        }
        if (req.session.deezer.token && !req.session.deezer.lifespan) {
            return next();
        }
        lastLogin = req.session.deezer.lastLogin;
        msElapsed = (new Date() - lastLogin);
        secondsElapsed = Math.ceil((1.0 * msElapsed) / 1000);
        secondsRemaining = req.session.deezer.lifespan - secondsElapsed;
        refreshThreshold = 360;
        if (secondsRemaining !== 0 && secondsRemaining < refreshThreshold) {
            return res.redirect('/login');
        }
        next();
    },
    userLogout: function(req, res) {
        delete req.session.deezer;
        res.redirect('/login');
    }
};
