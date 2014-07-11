'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var path = require('path');
var async = require('async');
var _ = require('lodash');

var pathPattern = '/images/<%= _id %>/<%= image.filename %>';

module.exports = function (schema, options) {

    var imagePath = _.template(options.path + pathPattern);
    var imageUrl = _.template(options.url + pathPattern);

    schema.add({
        image: {
            filename: String,
            fileSize: String,
            contentType: String
        }
    });

    schema.pre('remove', function (next) {
        this.detach(next);
    });

    schema.options.toJSON = {

        transform: function (doc, ret) {
            if (ret.image) {
                ret.image.url = imageUrl(ret);
            }
            return ret;
        }
    };

    schema.methods.attach = function (origPath, next) {

        var model = this;

        function extractTargetPath(callback) {
            callback(null, imagePath(model));
        }

        function moveToTargetPath(targetPath, callback) {
            mv(origPath, targetPath, {
                mkdirp: true
            }, callback);
        }

        function setUrl(callback) {
            model.image.url = imageUrl(model);
            callback(null);
        }

        async.waterfall([
            extractTargetPath,
            moveToTargetPath,
            setUrl
        ], next);
    };

    schema.methods.detach = function (next) {
        rimraf(path.dirname(imagePath(this)), next);
    };
};
