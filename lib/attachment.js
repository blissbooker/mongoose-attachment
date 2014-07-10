'use strict';

var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function (schema, options) {

    schema.add({
        image: {
            filename: String,
            fileSize: String,
            contentType: String,
            url: String
        }
    });

    schema.pre('remove', function (next) {
        this.detach(next);
    });

    schema.methods.attach = function (origPath, next) {

        var model = this;

        function extractTargetPath(callback) {
            callback(null, options.path(model));
        }

        function ensureTargetPath(targetPath, callback) {
            mkdirp(path.dirname(targetPath), function (err) {
                callback(err, targetPath);
            });
        }

        function rename(targetPath, callback) {
            fs.rename(origPath, targetPath, callback);
        }

        function setUrl(callback) {
            model.image.url = options.url(model);
            callback(null);
        }

        async.waterfall([
            extractTargetPath,
            ensureTargetPath,
            rename,
            setUrl
        ], next);
    };

    schema.methods.detach = function (next) {
        rimraf(path.dirname(options.path(this)), next);
    };
};
