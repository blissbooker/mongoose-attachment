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
    var resources = path.join(fixtures, 'resources');
    var tmp = path.join(fixtures, '.tmp');
    var assets = path.join(tmp, 'assets');

    var mammothFixture = fs.realpathSync(resources + '/mammoth.png');
    var mammothSource = mammothFixture + '-tmp.png';

    var spongebobFixture = fs.realpathSync(resources + '/spongebob.png');
    var spongebobSource = spongebobFixture + '-tmp.png';


    function assetPath(asset) {
        return assets + '/' + asset.id + '.png';
    }

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
            expect(fs.existsSync(assetPath(mammoth))).to.be.true;
            done();
        });
    });

    it('assigns the url', function (done) {
        mammoth.attach(mammothSource, function () {
            expect(mammoth.toJSON().image.url).to.equal('/system/assets/' + mammoth.id + '.png');
            done();
        });
    });

    describe('detach', function () {

        it('deletes the assigned image', function (done) {
            async.series([
                function (callback) {
                    mammoth.attach(mammothSource, function () {
                        expect(fs.existsSync(assetPath(mammoth))).to.be.true;
                        mammoth.save(callback);
                    });
                },
                function (callback) {
                    mammoth.remove(function (err) {
                        expect(fs.existsSync(assetPath(mammoth))).to.be.false;
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
                        expect(fs.existsSync(assetPath(mammoth))).to.be.true;
                        spongebob.save(callback);
                    });
                },
                function (callback) {
                    mammoth.remove(function (err) {
                        expect(fs.existsSync(assetPath(spongebob))).to.be.true;
                        callback(err);
                    });
                }
            ], done);
        });
    });

});
