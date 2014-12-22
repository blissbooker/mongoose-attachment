'use strict';

var mongoose = require('mongoose');
var plugin = require('../../lib/attachment');

module.exports = function (options) {
    var Schema = new mongoose.Schema({});
    Schema.plugin(plugin, options);

    return Schema;
};
