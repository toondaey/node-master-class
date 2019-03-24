/**
 * Main file for all helpers
 */
// Dependencies
const strings = require('./strings')
    hash = require('./hash'),
    mail = require('./mail'),
    payment = require('./payment'),
    promisify = require('./promisify');

/**
 * @description Main helpers container.
 * @type {Object}
 */
let helpers = {};

/**
 * @description String helpers
 * @type {Object}
 */
helpers.strings = strings;

/**
 * @description Hash helpers
 * @type {Object}
 */
helpers.hash = hash;

/**
 * @description Mail helpers
 * @type {Object}
 */
helpers.mail = mail;

/**
 * @description Payment helpers
 * @type {Object}
 */
helpers.payment = payment;

/**
 * @description Hash helpers
 * @type {Object}
 */
helpers.promisify = promisify;

/**
 * @description exporting string helpers.
 * @type {object}
 */
module.exports = helpers;
