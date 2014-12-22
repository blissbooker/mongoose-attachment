'use strict';

/*global describe, it, before, after, afterEach */

var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

var mongoose = require('mongoose');
var path = require('path');
var _ = require('lodash');

describe('Cloudinary Strategy', function () {

    var cloudinary = {

        config: _.noop,

        url: _.noop,

        uploader: {
            upload: _.noop
        },

        api: {
            //jshint camelcase:false
            delete_resources: _.noop
        }

    };

    var Model;
    var mammoth;

    var fixtures = path.join(__dirname, '..', 'fixtures');
    var resources = path.join(fixtures, 'resources');

    var mammothSource = fs.realpathSync(resources + '/mammoth.png');


    before(function () {
        mongoose.connect('mongodb://localhost/mockgoose_attachment_test');
        Model = require('../fixtures/cloudinary')(cloudinary);
        mammoth = new Model({
            image: {
                filename: 'mammoth.png',
                fileSize: 232030,
                contentType: 'image/png',
            }
        });
    });

    after(function () {
        mongoose.connection.db.dropDatabase();
        mongoose.connection.close();
    });

    describe('attach', function () {

        afterEach(function () {
            cloudinary.uploader.upload.restore();
        });

        describe('success', function () {

            before(function () {
                sinon.stub(cloudinary.uploader, 'upload').yields({});
            });

            it('uploads the image to cloudinary', function (done) {
                mammoth.attach(mammothSource, function () {
                    expect(cloudinary.uploader.upload).to.have.been.calledWith(mammothSource, sinon.match.typeOf('function'), {
                        public_id: mammoth.id.toString()
                    });
                    done();
                });
            });

        });

        describe('failure', function () {

            before(function () {
                sinon.stub(cloudinary.uploader, 'upload').yields({
                    error: 'The world is coming to an end!'
                });
            });

            it('exposes api errors', function (done) {
                mammoth.attach(mammothSource, function (err) {
                    expect(err).to.be.an.instanceof(Error);
                    expect(err.message).to.equal('The world is coming to an end!');
                    done();
                });
            });

        });

    });


    describe('url', function () {

        before(function () {
            sinon.stub(cloudinary.uploader, 'upload').yields({});
            sinon.stub(cloudinary, 'url').returns();
        });

        after(function () {
            cloudinary.uploader.upload.restore();
            cloudinary.url.restore();
        });

        it('assigns the url', function (done) {
            mammoth.attach(mammothSource, function () {
                mammoth.toJSON();
                expect(cloudinary.url).to.have.been.calledWithExactly(mammoth.id, {
                    format: 'png',
                    secure: true
                });
                done();
            });
        });
    });

    describe('detach', function () {

        afterEach(function () {
            cloudinary.api.delete_resources.restore();
        });

        describe('success', function () {

            before(function () {
                sinon.stub(cloudinary.api, 'delete_resources').yields({});
            });

            it('deletes the assigned image', function (done) {
                mammoth.remove(function (err) {
                    expect(err).to.be.null;
                    expect(cloudinary.api.delete_resources).to.have.been.calledWithExactly([mammoth.id], sinon.match.typeOf('function'));
                    done();
                });
            });
        });

        describe('failure', function () {

            before(function () {
                sinon.stub(cloudinary.api, 'delete_resources').yields({
                    error: 'You should not delete any content!'
                });
            });

            it('exposes api errors', function (done) {
                mammoth.remove(function (err) {
                    expect(err).to.be.an.instanceof(Error);
                    expect(err.message).to.equal('You should not delete any content!');
                    done();
                });
            });
        });

    });

});
