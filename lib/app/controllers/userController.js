var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    Rdio = require('_/dependencies/rdio.js');
module.exports = {

    userRoutes: function(app) {
        app.get('/login', this.renderLoginForm);
        app.get('/user/login', this.userLogin);
        app.get('/loginCallback', this.loginCallback);
        app.get('/api/1/user/current',this.getCurrentUser);
        app.get('/user/logout',this.userLogout);
    },
    renderLoginForm:function(req,res){
        res.render('users/login');
    },
    userLogin: function(req, res) {
        var rdio = new Rdio(config.streamApiConfig),
            callbackUrl = 'http://localhost/loginCallback';
        rdio.beginAuthentication(callbackUrl, function(err, authUrl) {
            if (err) {
                console.log(err);
                res.send({
                    status: false
                });
            } else {
                req.session.requestToken = {
                    token: rdio.token[0],
                    secret: rdio.token[1]
                };
                res.redirect(authUrl);
                console.log(authUrl);
            }

        });
    },
    loginCallback: function(req, res) {
        var requestToken = req.session.requestToken,
            verifier = req.query.oauth_verifier,
            rdio;
        if (requestToken && verifier) {
            rdio = new Rdio(config.streamApiConfig, [requestToken.token, requestToken.secret]);
            rdio.completeAuthentication(verifier, function(err) {
                if (err) {
                    res.send({
                        status: false
                    });
                } else {
                    req.session.accessToken = {
                        token: rdio.token[0],
                        secret: rdio.token[1]
                    };

                    delete req.session.requestToken;
                    res.redirect('/');
                }

            });
        } else {
            req.redirect('/logout');
        }
    },
    getCurrentUser:function(req,res){
        var accessToken,
            rdio,
            currentUser;
        if(req.session.accessToken){
            accessToken=req.session.accessToken;
        }else if(req.body.accessToken){
            accessToken=req.body.accessToken;
        }
        if(accessToken){
            rdio=new Rdio(config.streamApiConfig,[accessToken.token, accessToken.secret]);
            rdio.call('currentUser',{'extras':'isFree'},function(err,data){
                if(err){
                    res.send({status:false});
                }else{
                    currentUser=data.result;
                    res.send(currentUser);
                }
            });
        }else{
            res.send({status:false});
        }
    },
    isAuthenticated:function(req,res,next){
        if(req.session.accessToken){
            next();
        }else{
            res.redirect('/login');
        }
    },
    userLogout:function(req,res){
        delete req.session.accessToken;
        res.redirect('/');
    }
};
