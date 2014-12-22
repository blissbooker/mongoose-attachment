'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var mimes = require('mime-types');

var internals = {};

internals.separator = '/';

internals.expand = function (prefix) {
    return function (id, asset) {

        var extension = mimes.extension(asset.contentType);
        var filename = id + '.' + extension;

        return [prefix, 'resources', filename].join(internals.separator);
    };
};

module.exports = function (config) {

    var url = internals.expand(config.url);
    var path = internals.expand(config.path);

    return {

        url: url,

        attach: function (id, asset, source, next) {
            var options = {
                mkdirp: true
            };
            mv(source, path(id, asset), options, next);
        },

        detach: function (id, asset, next) {
            rimraf(path(id, asset), next);
        }

    };
};
