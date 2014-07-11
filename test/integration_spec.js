'use strict';

/*global describe, it, before, beforeEach */

var expect = require('chai').expect;
var Model = require('./fixtures/model');
var fs = require('fs');
var async = require('async');
var rimraf = require('rimraf');
var mongoose = require('mongoose');


describe('Integration', function () {

    var mammoth;

    var fixturesPath = __dirname + '/fixtures';
    var tmpPath = fixturesPath + '/.tmp';
    var tmpImagePath = tmpPath + '/images';

    var mammothFixturePath = fs.realpathSync(fixturesPath + '/mammoth.png');
    var mammothPath = mammothFixturePath + '-tmp.png';

    var spongebobFixturePath = fs.realpathSync(fixturesPath + '/spongebob.png');
    var spongebobPath = spongebobFixturePath + '-tmp.png';

    mongoose.connect('mongodb://localhost/mockgoose_attachment_test');

    function createMammoth() {
        return new Model({
            image: {
                filename: 'mammoth.png',
                fileSize: 232030,
                contentType: 'image/png',
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
        mammoth = createMammoth()
    });

    after(function (done) {
        mongoose.connection.db.dropDatabase();
        rimraf(tmpPath, done);
    });

    it('provides attach method', function (done) {
        expect(mammoth).to.respondTo('attach');
        done();
    });

    it('provides detach method', function (done) {
        expect(mammoth).to.respondTo('detach');
        done();
    });

    describe('Image filsystem handling', function () {

        beforeEach(function () {
            fs.createReadStream(mammothFixturePath).pipe(fs.createWriteStream(mammothPath));
        });

        it('moves the image to the given target path', function (done) {
            mammoth.attach(mammothPath, function (err) {
                expect(err).to.be.null;
                expect(fs.existsSync(tmpImagePath + '/' + mammoth.id + '/' + mammoth.image.filename)).to.be.true;
                done();
            });
        });

        it('assigns the url', function (done) {
            mammoth.attach(mammothPath, function (err) {
                expect(err).to.be.null;
                expect(mammoth.image.url).to.equal('/system/images/' + mammoth.id + '/' + mammoth.image.filename);
                done();
            });
        });

        describe('deleting', function () {

            it('deletes the assigned image', function (done) {
                async.series([
                    function (callback) {
                        mammoth.attach(mammothPath, function (err) {
                            mammoth.save(callback);
                        });
                    },
                    function (callback) {
                        mammoth.remove(function (err) {
                            expect(fs.existsSync(tmpImagePath + '/' + mammoth.id)).to.be.false;
                            callback(err);
                        });
                    }
                ], done);
            });

            it('leaves existing images untouched', function (done) {

                var spongebob = createSpongebob();

                async.series([
                    function (callback) {
                        mammoth.attach(mammothPath, function (err) {
                            mammoth.save(callback);
                        });
                    },
                    function (callback) {
                        fs.createReadStream(spongebobFixturePath).pipe(fs.createWriteStream(spongebobPath));
                        spongebob.attach(spongebobPath, callback);
                    },
                    function (callback) {
                        mammoth.remove(function (err) {
                            expect(fs.existsSync(tmpImagePath + '/' + spongebob.id)).to.be.true;
                            callback(err);
                        });
                    }
                ], done);
            });
        });

    });


});
