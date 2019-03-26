/**
 * This file houses all server related module operations.
 */
// Dependencies
const __processing = require('./processing'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    config = require(`${__baseDir}/config`),
    __handlers = require('../handlers');

/**
 * @description Server module container.
 */
let lib = {};

/**
 * Processes server request and responses.
 * @type {Function}
 */
lib.__processing = __processing.init(__handlers);

/**
 * Server request handlers.
 * @type {Object}
 */
lib.requests = {...__handlers};

/**
 * @description Create an http server.
 * @type {Object}
 */
lib.http = http.createServer(lib.__processing);

/**
 * @description Https configuration
 * @type {Object}
 */
lib.httpsConfig = {
    key: path.join(__dirname, '../../.https/key.pem'),
    cert: path.join(__dirname, '../../.https/cert.pem')
};

/**
 * @description Create an https server.
 */
lib.https = https.createServer(lib.httpConfig, lib.__processing);

// Server starter.
lib.init = () => {
    // Server listener for http
    lib.http.listen(
        config.httpPort,
        () => console.log('\x1b[34m%s\x1b[0m', `Http server in ${config.environment} environment listening on ${config.httpPort}`)
    );

    // Server listener for http
    lib.https.listen(
        config.httpsPort,
        () => console.log('\x1b[36m%s\x1b[0m', `Https server in ${config.environment} environment listening on ${config.httpsPort}`)
    );
};

/**
 * @description Export module
 */
module.exports = lib;
