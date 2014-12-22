'use strict';

var internals = {};

internals.resource = function (attribute) {
    var resource = {};

    resource[attribute] = {
        filename: String,
        fileSize: String,
        contentType: String
    };

    return resource;
};

internals.strategy = function (options) {
    var strategy = require('./strategies/' + (options.strategy || 'filesystem'));
    return strategy(options.config);
};

module.exports = function (schema, options) {

    var attribute = options.attribute;
    var strategy = internals.strategy(options);

    schema.add(internals.resource(attribute));

    schema.pre('remove', function (next) {
        this.detach(next);
    });

    schema.options.toJSON = {

        transform: function (doc, ret) {
            var resource = ret[attribute];
            if (resource) {
                resource.url = strategy.url(doc.id, resource);
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
