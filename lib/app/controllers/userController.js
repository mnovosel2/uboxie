var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    DZ = require('node-deezer'),
    asnyc = require('async'),
    request = require('request'),
    deezer = new DZ();
/**
 * [User controller module]
 * @type {Object}
 */
module.exports = {
    /**
     * [userRoutes Login routes pointing to Deezer API service]
     * @param  {Object} app [Express app object]
     */
    userRoutes: function(app) {
        app.get('/login', this.userLogin);
        app.get('/loginCallback', this.loginCallback);
        app.get('/api/1/user/current/:token?', this.getCurrentUser);
        app.get('/user/logout', this.userLogout);
    },
    /**
     * [userLogin displays application homepage]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     */
    userLogin: function(req, res) {
        var callbackUrl = 'http://localhost/loginCallback',
            permissions = ['basic_access'],
            appId = config.streamApiConfig[0],
            authLink = deezer.getLoginUrl(appId, callbackUrl, permissions);

        res.render('users/login', {
            authLink: authLink
        });
    },
    /**
     * [loginCallback login callback used by deezer API service, redirects to application homepage]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     */
    loginCallback: function(req, res,next) {
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
        }else{
            deezer.createSession(appId, appSecret, code, function(err, result) {
                if (err) return next(err);
                if(req.session.deezer){
                    delete req.session.deezer;
                }
                req.session.deezer = {
                    lifespan: result.expires,
                    token: result.accessToken,
                    lastLogin: new Date()
                };

                res.redirect('/');

            });
        }
    },
    /**
     * [getCurrentUser in progress...]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     */
    getCurrentUser: function(req, res) {
        var token=req.params.token || req.session.deezer.token;
        if(token){
            deezer.request(token,{
                resource:'user/me',
                method:'get'
            },function(err,result){
                if(err){
                    res.send({
                        status:false,
                        message:'Error handling request'
                    });
                }else{

                    res.send({
                        status:true,
                        message:result
                    });
                }
            });
        }else{
            res.send({
                status:false,
                message:'Missing required data'
            });
        }
    },
    /**
     * [isAuthenticated checks if current user is authenticated]
     * @param  {Object}   req  [Express request object]
     * @param  {Object}   res  [Express response object]
     * @param  {Function} next [Express function for calling next() middleware]
     */
    isAuthenticated: function(req, res, next) {
        var lastLogin,
            msElapsed,
            secondsElapsed,
            secondsRemaining;

        console.log('Checking Deezer token...', req.session.deezer);
        if (!req.session.deezer) {
            return res.redirect('/login');
        }
        if (req.session.deezer.token && !req.session.deezer.lifespan) {
            return next();
        }
        lastLogin = req.session.deezer.lastLogin;
        msElapsed = (new Date() - new Date(lastLogin));
        secondsElapsed = Math.ceil((1.0 * msElapsed) / 1000);
        secondsRemaining = req.session.deezer.lifespan - secondsElapsed;
        if (secondsRemaining <= 0) {
            return res.redirect('/login');
        }
        next();
    },
    /**
     * [userLogout logs out current user from application]
     * @param  {Object} req [Express request object]
     * @param  {Object} res [Express response object]
     */
    userLogout: function(req, res) {
        delete req.session.deezer;
        res.redirect('/login');
    }
};
