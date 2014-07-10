'use strict';

var mongoose = require('mongoose');
var plugin = require('../lib/attachment');
var tmpDir = require('os').tmpDir();

var Schema = new mongoose.Schema({});
Schema.plugin(plugin, {
    path: function (model) {
        return tmpDir + model._id;
    },
    url: function (model) {
        return tmpDir + model._id;
    }
});
module.exports = mongoose.model('User', Schema);

