'use strict';

var cloudinary;
var mimes = require('mime-types');

var internals = {};

internals.fn = function (next) {
    return function (result) {
        console.log('result: ', result);
        if (result.error) {
            return next(new Error(result.error));
        }
        next(null, result);
    };
};

module.exports = function (config) {

    var secure = config.secure;

    cloudinary = config.cloudinary || require('cloudinary');
    cloudinary.config(config);

    return {

        url: function (id, resource) {
            return cloudinary.url(id, {
                secure: secure,
                format: mimes.extension(resource.contentType)
            });
        },

        attach: function (id, resource, source, next) {
            console.log('cloudinary strategy, uploading ', source);
            cloudinary.uploader.upload(source, internals.fn(next), {
                //jshint camelcase:false
                public_id: id
            });
        },

        detach: function (id, resource, next) {
            //jshint camelcase:false
            cloudinary.api.delete_resources([id], internals.fn(next));
        }

    };
};
