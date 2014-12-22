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

internals.strategy = function (options) {
    var strategy = require('./strategies/' + (options.strategy || 'filesystem'));
    return strategy(options.config);
};

module.exports = function (schema, options) {

    var attribute = options.config.attribute;
    var strategy = internals.strategy(options);

    schema.add(internals.asset(attribute));

    schema.pre('remove', function (next) {
        this.detach(next);
    });

    schema.options.toJSON = {

        transform: function (doc, ret) {
            var asset = ret[attribute];
            if (asset) {
                asset.url = strategy.url(doc.id, asset);
            }
            return ret;
        }

    };

    schema.methods.attach = function (source, next) {
        strategy.attach(this.id, this[attribute], source, next);
    };

    schema.methods.detach = function (next) {
        strategy.detach(this.id, this[attribute], next);
    };
};
