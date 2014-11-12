var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js');

module.exports = {

    userRoutes: function(app, passport){
        /**********Views**********/
        app.get('/users/login', this.userLoginPage);
        app.get('/users/register', this.userRegisterPage);
        /***********Api**********/
        app.post('/api/1/users/login', passport.authenticate('local'), this.userLogin);
        app.post('/api/1/users/register', this.userRegistration);
    },
    userLoginPage: function(req, res) {

        res.render('users/login');

    },
    userRegisterPage: function(req, res) {

        res.render('users/register');

    },
    userLogin: function(req, res) {
        console.log(req.body);

        

        res.status(200).end();

    },
    userRegistration: function(req, res) {

        console.log(req.body);

        var request = req.body;

        new models.user(request).save(function(err, savedUser) {

            if(err){
                console.log('error(userRegistration):' + err);
                res.status(400).end();
            }else{
                res.status(200).end();
            }

        });
    }
	
};