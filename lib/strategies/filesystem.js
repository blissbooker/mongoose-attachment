'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var mimes = require('mime-types');

var internals = {};

internals.separator = '/';
internals.resources = 'resources';

internals.expand = function (prefix) {
    return function (id, resource) {

        var extension = mimes.extension(resource.contentType);
        var filename = id + '.' + extension;

        return [prefix, internals.resources, filename].join(internals.separator);
    };
};

module.exports = function (config) {

    var url = internals.expand(config.url);
    var path = internals.expand(config.path);

    return {

        url: url,

        attach: function (id, resource, source, next) {
            var options = {
                mkdirp: true
            };
            console.log('filesystem, moving ', source, ' to ', path(id, resource));
            mv(source, path(id, resource), options, next);
        },

        detach: function (id, resource, next) {
            rimraf(path(id, resource), next);
        }

    };
};
