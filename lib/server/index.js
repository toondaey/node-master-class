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
let server = {};

/**
 * Processes server request and responses.
 * @type {Function}
 */
server.__processing = __processing.init(__handlers);

/**
 * Server request handlers.
 * @type {Object}
 */
server.requests = {...__handlers};

/**
 * @description Create an http server.
 * @type {Object}
 */
server.http = http.createServer(server.__processing);

/**
 * @description Https configuration
 * @type {Object}
 */
server.httpsConfig = {
    key: path.join(__dirname, '../../.https/key.pem'),
    cert: path.join(__dirname, '../../.https/cert.pem')
};

/**
 * @description Create an https server.
 */
server.https = https.createServer(server.httpConfig, server.__processing);

// Server starter.
server.init = () => {
    // Server listener for http
    server.http.listen(
        config.httpPort,
        () => console.log('\x1b[34m%s\x1b[0m', `Http server in ${config.environment} environment listening on ${config.httpPort}`)
    );

    // Server listener for http
    server.https.listen(
        config.httpsPort,
        () => console.log('\x1b[36m%s\x1b[0m', `Https server in ${config.environment} environment listening on ${config.httpsPort}`)
    );
};

/**
 * @description Export module
 */
module.exports = server;
