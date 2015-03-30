/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node:true */
"use strict";
function getApp(cfg) {
    var app = require('./server')(cfg);
    require('http').createServer(app);
    return app;
}
module.exports = getApp;
