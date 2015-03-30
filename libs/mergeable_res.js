/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node: true */

"use strict";

var _ = require('lodash'),
    getMergeableRes = function (res, callback) {
        var new_res = {
            data: "",
            status: 200,
            origRes: res,
            headers: {},
            write: function (data) {
                this.data += data;
            },
            send: function (arg1, arg2) {
                // allow status / body
                if (arguments.length === 2) {
                    //the statusCode is sent
                    this.status = arg1;
                    this.data = arg2;
                } else {
                    this.data = arg1;
                }
                this.end();
            },
            end: function () {
                callback(this.status, this.data);
            },
            set: function (obj) {
                this.headers = _.merge(this.headers, obj);
            }
        };

        return new_res;
    };

module.exports = getMergeableRes;
