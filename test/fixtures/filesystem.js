'use strict';

var mongoose = require('mongoose');

var options = {
    strategy: 'filesystem',
    config: {
        attribute: 'image',
        path: __dirname + '/.tmp',
        url: '/system'
    }
};
var schema = require('./schema');

module.exports = mongoose.model('Filesystem', schema(options));
