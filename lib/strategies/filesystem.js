'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var path = require('path');
var mimes = require('mime-types');

var internals = {};

internals.separator = '/';

internals.expand = function (prefix) {
    return function (id, asset) {

        var extension = mimes.types[asset.contentType];
        var filename = id + '.' + extension;

        return [prefix, 'assets', filename].join(internals.separator);
    };
};

module.exports = function (options) {

    var expandUrl = internals.expand(options.url);
    var expandPath = internals.expand(options.path);

    return {

        url: expandUrl,

        attach: function (id, asset, source, next) {
            var options = {
                mkdirp: true
            };

            mv(source, expandPath(id, asset), options, next);
        },

        detach: function (id, asset, next) {
            rimraf(path.dirname(expandPath(id, asset)), next);
        }

    };
};
