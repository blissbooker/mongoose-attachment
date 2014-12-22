'use strict';

/*global describe, it, before */

var expect = require('chai').expect;
var Model = require('./fixtures/filesystem');

describe('Attachment', function () {

    var subject;

    before(function () {
        subject = new Model({
            image: {
                filename: 'mammoth.png',
                fileSize: 232030,
                contentType: 'image/png',
            }
        });
    });

    it('extends the schema', function (done) {
        expect(subject.schema.paths['image.filename']).to.exist;
        expect(subject.schema.paths['image.fileSize']).to.exist;
        expect(subject.schema.paths['image.contentType']).to.exist;

        done();
    });

    it('provides a attach method', function (done) {

        expect(subject).to.respondTo('attach');
        done();
    });

    it('provides a detach method', function (done) {
        expect(subject).to.respondTo('detach');
        done();
    });

});
