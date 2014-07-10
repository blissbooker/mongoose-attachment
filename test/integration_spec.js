'use strict';

/*global describe, it, before */

var expect = require('chai').expect;
var Model = require('./fixtures');

describe('Integration', function () {

    var model;

    before(function () {
        model = new Model();
    });

    it('provides attach method', function (done) {
        expect(model).to.respondTo('attach');
        done();
    });

    it('provides detach method', function (done) {
        expect(model).to.respondTo('detach');
        done();
    });

});
