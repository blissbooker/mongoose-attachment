'use strict';

var cloudinary;
var mimes = require('mime-types');

var internals = {};

internals.fn = function (next) {
    return function (result) {
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

        url: function (id, asset) {
            return cloudinary.url(id, {
                secure: secure,
                format: mimes.extension(asset.contentType)
            });
        },

        attach: function (id, asset, source, next) {
            cloudinary.uploader.upload(source, internals.fn(next), {
                //jshint camelcase:false
                public_id: id
            });
        },

        detach: function (id, asset, next) {
            //jshint camelcase:false
            cloudinary.api.delete_resources([id], internals.fn(next));
        }

    };
};
