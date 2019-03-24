/**
 * Hash helpers.
 */
// Dependendies
const crypto = require('crypto'),
    config = require(`${__baseDir}/config`);

/**
 * @description Main hash helper container.
 * @type {Function}
 */
let lib = {};

/**
 * @description Hash string
 * @type {Function}
 */
lib.hash = data => {
    try {
        // Convert data to string if an object.
        data = typeof data === 'string' ? data : JSON.stringify(data);

        // Create hmac updated with data and digested to hexadecimal
        return crypto.createHmac('sha256', config.hashingSecret).update(data).digest('hex');
    } catch (e) {
        return false;
    }
};

module.exports = lib;
