/* Copyright (c) 2015 Yahoo Inc. */
/*jshint node: true */

"use strict";
var parser = require('yargs'),
    mockaccino = require('./server'),
    mockresponses,
    app,
    cfgFile,
    port,
    maxSockets = 150,
    http,
    argv;

argv = parser.argv;
http = require('http');
http.globalAgent.maxSockets = maxSockets;

if (argv.help) {
    console.log("Mockaccino help\n\n");
    console.log("--config allows you to specify the config file");
    console.log("--port   allows you to specify which port mockaccino will be listening to");
    console.log("--help shows this");
    return;
}

cfgFile = argv.config;

if (cfgFile) {
    mockresponses = require("./" + cfgFile);
} else {
    throw "Usage: node app --config configFile [--port PORT]";
}
port = argv.port || 8081;

app = mockaccino(mockresponses);

//if it's running stand alone
http.createServer(app).listen(port, function () {
    console.log('[Mockaccino] listening on port ' + port);
});


