'use strict';

var cloudinary = require('cloudinary');
var mimes = require('mime-types');

var internals = {};

internals.fn = function (next) {
    return function (result) {
        next(result.error, result);
    };
};

module.exports = function (options) {

    var secure = options.secure;

    cloudinary.config(options.config);

    return {

        url: function (id, asset) {
            return cloudinary.url(id, {
                secure: secure,
                format: mimes.types[asset.contentType]
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
