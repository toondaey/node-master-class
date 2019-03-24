/**
 * Main middleware file.
 */
// Dependencies
const tokenMiddleware = require('./tokens');

/**
 * @description Main middleware container.
 * @type {Object}
 */
let lib = {};

/**
 * Token validation middleware.
 * @type {Function}
 */
lib.token = tokenMiddleware;

// Export middleware
module.exports = lib;
