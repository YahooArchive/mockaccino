/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node:true */
"use strict";
var util = require("util"),
    log = util.log,
    fs = require("fs"),
    path = require("path"),
    dirname,
    utils = {
        /**
         * Serves a file to the response
         * @method serveStaticFile
         * @param  {string} filename        Full path to get the file
         * @param  {number} statusCode      HTTP status code you want to serve
         * @param  {Object} req             Request
         * @param  {Object} res             Response
         */
        serveStaticFile: function (req, res, filename, statusCode) {
            statusCode = statusCode || 200;
            log("[Mockaccino] Getting file " + filename);
            res.set({'Content-Type': "application/json"});
            fs.readFile(dirname + filename, function (err, data) {
                if (!err) {
                    res.send(statusCode, data.toString());
                } else {
                    log("[ERROR] " + err);
                    res.send(404, "Couldn't find the file to be served.... grrrrrr " + dirname + filename);
                }
            });

        },
        /**
         * Returns the property identified by the path (in dot notation)
         * @method walkJSONDot
         * @param  {object}    obj  An object
         * @param  {string}    path A path expressed in dot notation
         * @return {object}         The part of object referenced by the path
         */
        walkJSONDot: function (obj, path) {
            var current = obj;

            if ((typeof obj !== "object") || (!obj)) {
                return;
            }

            path.split(".").every(function (property) {
                current = current[property];
                if (current === undefined) {
                    return false;
                } else {
                    return true;
                }
            });


            return current;
        }
    };

module.exports = function (_dirname) {
    dirname = _dirname || path.dirname(require.main.filename);
    return utils;
};
