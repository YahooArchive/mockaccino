/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node: true */
/*global describe, it */
"use strict";
var expect = require('chai').expect,
    mergeableRes = require('../../../libs/mergeable_res.js');
describe('Mergeable Response', function () {

    it("should be constructor and return an object", function (done) {
        var res = mergeableRes({}, undefined);
        expect(typeof res).to.equals('object');
        done();
    });

    describe("basic functionalities", function () {
        var origRes = {"orig": "testOrig"};

        it("- write should append the data", function () {
            var res = mergeableRes(origRes, undefined);
            res.write("test");
            res.write("test2");
            expect(res.data).to.equals('testtest2');
        });


        it("- End should call the callback with data and default statuscode", function (done) {
            var res = mergeableRes(origRes, function (statusCode, data) {
                expect(data).to.equals("1");
                expect(statusCode).to.equals(200);
                done();
            });
            res.write("1");
            res.end();
        });

        it("- Send should call the callback with data and statuscode if defined", function (done) {
            var res = mergeableRes(origRes, function (statusCode, data) {
                expect(data).to.equals("1");
                expect(statusCode).to.equals(404);
                done();
            });
            res.send(404, "1");
        });


        it("- Send should call the callback with data and default statuscode if not defined", function (done) {
            var res = mergeableRes(origRes, function (statusCode, data) {
                expect(data).to.equals("1");
                expect(statusCode).to.equals(200);
                done();
            });
            res.send("1");
        });

        it("- Set should set the headers as a merge of the passed objects", function () {
            var res = mergeableRes(origRes, undefined),
                expectedObj = {"header1": "test", "header2": "test2"};

            res.set({"header1": "test"});
            res.set({"header2": "test2"});
            expect(res.headers).deep.equal(expectedObj);

        });

        it("- Should keep the original object whatever the operations", function (done) {
            var res = mergeableRes(origRes, function () {
                    expect(res.origRes).deep.equal(origRes);
                    done();
                });

            res.set({"header1": "test"});
            res.write("Hey");
            res.end();

        });

    });
});
