'use strict';

var mv = require('mv');
var rimraf = require('rimraf');
var path = require('path');
var _ = require('lodash');


module.exports = function (schema, options) {

    var pathPattern = '/images/<%= _id %>/<%= image.filename %>';
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

        var options = {
            mkdirp: true
        };

        mv(origPath, imagePath(this), options, next);
    },

    schema.methods.detach = function (next) {
        rimraf(path.dirname(imagePath(this)), next);
    };
};
