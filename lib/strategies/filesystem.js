'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var mimes = require('mime-types');
var path = require('path');

var internals = {};

internals.resources = 'resources';

internals.expand = function (prefix) {
    return function (id, resource) {

        var extension = mimes.extension(resource.contentType);
        var filename = id + '.' + extension;

        return [prefix, internals.resources, filename].join(path.sep);
    };
};

module.exports = function (config) {

    var resourceUrl = internals.expand(config.url);
    var resourcePath = internals.expand(config.path);

    return {

        url: resourceUrl,

        attach: function (id, resource, source, next) {
            var options = {
                mkdirp: true
            };
            mv(source, resourcePath(id, resource), options, next);
        },

        detach: function (id, resource, next) {
            rimraf(resourcePath(id, resource), next);
        }

    };
};
