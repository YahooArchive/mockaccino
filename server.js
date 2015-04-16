/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node: true */

/**
 * This is a node server used to mock a web service layer
 *  @author R.Cocetta
 */

"use strict";
var path = require('path'),
    express = require('express'),
    app = express(),
    url = require('url'),
    util = require("util"),
    log = util.log,
    getMergeableRes = require('./libs/mergeable_res.js'),
    ext_libs = {},
    _ = require('lodash'),
    parent = module.parent.parent || module.parent,
    embedded = !!module.parent.parent,
    dirname = path.dirname(parent.filename),
    mockUtils = require("./utils.js")(dirname);



/**
 * Used to handle mock endpoint that extend other mocks.
 * @method handleExtendEndpoint
 */
function handleExtendEndpoint(req, res, cfgItem, key, method, cfg) {
    var qsOverride = {},
        new_res = getMergeableRes(res, function (statusCode, data) {
            var result;
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            result = _.merge(data, cfgItem.obj);
            serveObject(req, res, res.statusCode, data);
        }),
        qsParamName = cfg.qsParam || "tc";

    qsOverride[qsParamName] = cfgItem.extendFrom;
    handleRequest(key, cfg, method, qsOverride, req, new_res);
}


/**
 * Serves the static file associated with a key
 * @param   {object} req The request obj
 * @param   {object} res The response object
 * @param   {object} cfgItem the Config item associated with the enpoint you're treating now
 * @param   {string} key A key in the mockResponses object
 */
function serveStaticFileForKey(req, res, cfgItem, key, method) {
    var statusCode = cfgItem.statusCode || 200;
    log("[Mockaccino] Serving static file" + __dirname + cfgItem.path);
    mockUtils.serveStaticFile(req, res, cfgItem.path, statusCode);
}


/**
 * Serves the static file associated with a key
 * @param   {object} req The request obj
 * @param   {object} res The response object
 * @param   {object} cfgItem the Config item associated with the enpoint you're treating now
 * @param   {string} key A key in the mockResponses object
 */
function serveObject(req, res, statusCode, object) {
    log("[Mockaccino] Serving object");
    res.send(statusCode, object);
}


/**
 * Loads the external libs
 * @method loadExternalLibs
 * @param  {object}         cfg the config object
 */
function loadExternalLibs(cfg) {
    Object.keys(cfg.ext_libs).forEach(function (key) {
        ext_libs[key] = require(dirname + cfg.ext_libs[key]);
    });
}


/**
 * Returns an object describing the behaviour for a single request
 * @method getBehaviourForRequest
 * @param  {object}               cfg    the full config
 * @param  {object}               qs     the parse querystring
 * @param  {string}               key    the route key
 * @param  {string}               method the HTTP method
 * @return {object}                      an object containing {cfgItem, key, method, fn}
 */
function getBehaviourForRequest(req, res, cfg, qs, key, method) {
    var qsParam = cfg.queryStringParam,
        specConfig,
        mockResponses = cfg.mockResponses;
    if ((qs) && (qsParam) && (qs[qsParam]) && (mockResponses[qs[qsParam]]) && (mockResponses[qs[qsParam]][key]) && (mockResponses[qs[qsParam]][key][method])) {
        //if there is a defined behaviour for a specific query string parameter, and that parameter is defined
        specConfig = getBehaviourFor(cfg, key, qs[qsParam], method);
    } else {
        specConfig = getBehaviourFor(cfg, key, "default", method);
    }
    return specConfig;
}

/**
 * Returns thje specific behaviour for an endpoint
 * @method getBehaviourFor

 * @param  {object}        cfg    the full config
 * @param  {string}        key    the route key
 * @param  {[type]}        qsVal  The Query string value
 * @param  {string}        method the HTTP method
 * @return {object}        an object containing {cfgItem, key, method, fn}
 */
function getBehaviourFor(cfg, key, qsVal, method) {
    var mockResponses = cfg.mockResponses[qsVal],
        cfgItem = mockResponses[key][method],
        resObject = {
            "cfgItem": cfgItem,
            "key": key,
            "method": method
        },
        fn;

    if (cfgItem.type === "staticFile") {
        fn = serveStaticFileForKey;
    } else if (cfgItem.type === "function") {
        fn = mockUtils.walkJSONDot(ext_libs, cfgItem.fn);
    } else if (cfgItem.type === "extend") {
        fn = handleExtendEndpoint;
    }
    resObject.fn = fn;
    return resObject;
}


/**
 * Handles a request
 * @method handleRequest
 * @param  {string}      key        the route key
 * @param  {object}      cfg        the full config
 * @param  {string}      method     the HTTP method
 * @param  {object}      req        The Express req
 * @param  {object}      res        The Express res
 * @param  {object}      qsOverride Used to override the querystring
 */
function handleRequest(key, cfg, method, qsOverride, req, res) {
    var qs = qsOverride || url.parse(req.url, true).query,
        behaviour = getBehaviourForRequest(req, res, cfg, qs, key, method);

    behaviour.fn(req, res, behaviour.cfgItem, behaviour.key, method, cfg);
}

function getMockserver(cfg) {
    var mockResponses;

    if (!cfg) {
        throw "FATAL: Mockaccino needs a config object to work";
    }

    mockResponses = cfg.mockResponses;

    //loads the libraries passed in the config
    loadExternalLibs(cfg);
    if (!embedded) {
        app.use(express.bodyParser());
    }
    app.use(express.logger());

    app.configure(function () {
        log("[Mockaccino] Creating routes");

        // for each line in the mockResponses configuration, creates a route
        // that either serves a file or runs a function
        Object.keys(mockResponses.default).forEach(function (key) {
            Object.keys(mockResponses.default[key]).forEach(function (method) {
                app[method](key, handleRequest.bind(this, key, cfg, method, null));
            });
        });
    });
    return app;
}


module.exports = getMockserver;
