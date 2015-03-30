/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node: true */

"use strict";
var mockUtils = require('../utils.js')(),
    counters = {},
    lib = {
        "count": function (req, res) {
            if (!counters.cnt1) {
                counters.cnt1 = 0;
            }
            if (counters.cnt1 === 3) {
                counters.cnt1 = 0;
                mockUtils.serveStaticFile("/mockfiles/cnt_3.json", req, res);
            } else if (counters.cnt1 === 2) {
                counters.cnt1 += 1;
                mockUtils.serveStaticFile("/mockfiles/cnt_2.json", req, res);
            } else {
                counters.cnt1 += 1;
                mockUtils.serveStaticFile("/mockfiles/cnt_1.json", req, res);
            }
        },
        "reset": function (req, res) {
            counters = {};
            res.send(204, "");
        }
    };

module.exports = lib;
