var config = require('_/config'),
    mongoose = require('mongoose'),
    models = require('../models/index.js'),
    DZ = require('node-deezer'),
    deezer = new DZ(),
    _ = require('underscore'),
    userController = require('./userController'),
    streamController;

module.exports = {
    streamRoutes: function(app) {
        streamController = this;
        app.post('/api/1/getTracks', this.getTracks);
    },
    getTracks: function(req, res) {
        var query = req.body.query,
            limit = req.body.limit,
            mask = req.body.mask,
            masked = {},
            track = {},
            token = null,
            structuredResultArray = [],
            data = {
                status: true,
                result: []
            };
        if (req.session.deezer) {
            if (req.session.deezer.token) {
                token = req.session.deezer.token;
            }
        } else {
            token = req.body.token;
        }
        if (token) {
            deezer.request(token, {
                    resource: 'search',
                    method: 'get',
                    fields: {
                        q: query
                    }
                },
                function(err, content) {
                    if (err) {
                        res.send({
                            status: false,
                            result: err
                        });
                    } else {
                        for (var i = 0; i < content.data.length; i++) {
                            track = {
                                key: content.data[i].id,
                                icon: content.data[i].album.cover,
                                info: content.data[i].album.title,
                                artist: content.data[i].artist.name,
                                name: content.data[i].title,
                                duration: content.data[i].duration
                            };
                            structuredResultArray.push(track);
                        }
                        data.result = structuredResultArray;
                        if (mask) {
                            masked = streamController.maskResponse(structuredResultArray, mask);
                            data.result = masked;
                        }
                        if (limit) {
                            data = {
                                status: true,
                                result: []
                            };
                            for (var j = 0; j < req.body.limit; j++) {
                                data.result.push(structuredResultArray[j]);
                            }
                        }
                        res.send(data);
                    }

                });
        }else{
            res.send({
                status:false,
                message:'Token not valid'
            });
        }

    },
    maskResponse: function(data, mask) {
        var keysToMask = mask.split(',');
        for (var i = 0; i < data.length; i++) {
            data[i] = _.pick(data[i], keysToMask);
        }
        return data;
    }
};
