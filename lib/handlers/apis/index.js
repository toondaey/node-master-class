/**
 * API handlers.
 */
// Dependencies...
const users = require('./users'),
    tokens = require('./tokens'),
    menu = require('./menu'),
    order = require('./order'),
    carts = require('./carts');

/**
 * @description Main handlers container.
 * @type {Object}
 */
let lib = {}

/**
 * Users handlers.
 * @type {Function}
 */
lib['api/users'] = users.init();

/**
 * Tokens handlers.
 * @type {Function}
 */
lib['api/tokens'] = tokens.init();

/**
 * Menu handlers.
 * @type {Function}
 */
lib['api/menu'] = menu.init();

/**
 * Carts handlers.
 * @type {Function}
 */
lib['api/carts'] = carts.init();

/**
 * Order handlers.
 * @type {Function}
 */
lib['api/order'] = order.init();

// Exporting module
module.exports = lib;


