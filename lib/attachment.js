'use strict';

var internals = {};

internals.asset = function (attribute) {
    var asset = {};

    asset[attribute] = {
        filename: String,
        fileSize: String,
        contentType: String
    };

    return asset;
};

module.exports = function (schema, options) {

    var attribute = options.attribute;
    var strategy = require('./strategies/' + (options.strategy || 'filesystem'));

    schema.add(internals.asset(attribute));

    schema.pre('remove', function (next) {
        this.detach(next);
    });

    schema.options.toJSON = {

        transform: function (doc, ret) {
            var asset = ret[attribute];
            if (asset) {
                asset.url = strategy.url(ret._id, asset);
            }
            return ret;
        }

    };

    schema.methods.attach = function (source, next) {
        strategy.attach(this._id, this[attribute], source, next);
    };

    schema.methods.detach = function (next) {
        strategy.detach(this._id, this[attribute], next);
    };
};
