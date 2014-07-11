'use strict';

var mongoose = require('mongoose');
var plugin = require('../../lib/attachment');
var tmpDir = __dirname + '/.tmp';

var assetConfig = {
    path: tmpDir,
    url: '/system'
};
var Schema = new mongoose.Schema({});
Schema.plugin(plugin, assetConfig);

module.exports = mongoose.model('User', Schema);
module.exports.assetConfig = assetConfig;
