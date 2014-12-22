'use strict';

/*global describe, it, before, beforeEach, after */

var expect = require('chai').expect;
var Model = require('../fixtures/filesystem');
var fs = require('fs');
var async = require('async');
var rimraf = require('rimraf');
var mongoose = require('mongoose');
var path = require('path');

describe('Filesystem Strategy', function () {

    var mammoth;

    var fixtures = path.join(__dirname, '..', 'fixtures');
    var images = path.join(fixtures, 'images');

    var tmp = path.join(fixtures, '.tmp');
    var resources = path.join(tmp, 'resources');

    var mammothFixture = fs.realpathSync(images + '/mammoth.jpg');
    var mammothSource = mammothFixture + '-tmp.jpg';

    var spongebobFixture = fs.realpathSync(images + '/spongebob.png');
    var spongebobSource = spongebobFixture + '-tmp.png';


    function resourcePath(model, ext) {
        return resources + '/' + model.id + '.' + ext;
    }

    function createMammoth() {
        return new Model({
            image: {
                filename: 'mammoth.jpg',
                fileSize: 232030,
                contentType: 'image/jpeg',
            }
        });
    }

    function createSpongebob() {
        return new Model({
            image: {
                filename: 'spongebob.png',
                fileSize: 114801,
                contentType: 'image/png',
            }
        });
    }

    before(function () {
        mongoose.connect('mongodb://localhost/mockgoose_attachment_test');
        mammoth = createMammoth();
    });

    beforeEach(function () {
        fs.createReadStream(mammothFixture).pipe(fs.createWriteStream(mammothSource));
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase();
        mongoose.connection.close();
        rimraf(tmp, done);
    });

    it('moves the image to target path', function (done) {
        mammoth.attach(mammothSource, function () {
            expect(fs.existsSync(resourcePath(mammoth, 'jpeg'))).to.be.true;
            done();
        });
    });

    it('assigns the url', function (done) {
        mammoth.attach(mammothSource, function () {
            expect(mammoth.toJSON().image.url).to.equal('/system/resources/' + mammoth.id + '.jpeg');
            done();
        });
    });

    describe('detach', function () {

        it('deletes the assigned image', function (done) {
            async.series([
                function (callback) {
                    mammoth.attach(mammothSource, function () {
                        expect(fs.existsSync(resourcePath(mammoth, 'jpeg'))).to.be.true;
                        mammoth.save(callback);
                    });
                },
                function (callback) {
                    mammoth.remove(function (err) {
                        expect(fs.existsSync(resourcePath(mammoth, 'jpeg'))).to.be.false;
                        callback(err);
                    });
                }
            ], done);
        });

        it('leaves existing images untouched', function (done) {

            var spongebob = createSpongebob();

            async.series([
                function (callback) {
                    mammoth.attach(mammothSource, function () {
                        mammoth.save(callback);
                    });
                },
                function (callback) {
                    fs.createReadStream(spongebobFixture).pipe(fs.createWriteStream(spongebobSource));
                    spongebob.attach(spongebobSource, function () {
                        expect(fs.existsSync(resourcePath(mammoth, 'jpeg'))).to.be.true;
                        spongebob.save(callback);
                    });
                },
                function (callback) {
                    mammoth.remove(function (err) {
                        expect(fs.existsSync(resourcePath(spongebob, 'png'))).to.be.true;
                        callback(err);
                    });
                }
            ], done);
        });
    });

});
