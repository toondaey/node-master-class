/**
 * Main worker entry file.
 */
// Dependencies
const logger = require('./logger');

/**
 * @description Main container.
 * @type {Object}
 */
let lib = {};

/**
 * @description Initial all background workers.
 * @return {undefined}
 */
lib.init = () => {
    setInterval(() => {
        logger.compressTruncate();
    }, 1000);
};

// Exporting...
module.exports = lib;
