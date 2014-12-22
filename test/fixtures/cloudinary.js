'use strict';

var mongoose = require('mongoose');

var options = {
    strategy: 'cloudinary',
    config: {
        //jshint camelcase:false
        attribute: 'image',
        cloud_name: 'test',
        api_key: '123',
        api_secret: '123',
        secure: true
    }
};
var schema = require('./schema');

module.exports = function (cloudinary) {
    options.config.cloudinary = cloudinary;
    return mongoose.model('Cloudinary', schema(options));
};
