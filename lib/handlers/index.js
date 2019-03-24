/**
 * All request handlers and corresponding operations.
 */
// Dependencies
const users = require('./users'),
    tokens = require('./tokens'),
    menu = require('./menu'),
    order = require('./order'),
    carts = require('./carts');

/**
 * @description Main handlers container.
 * @type {Object}
 */
let handlers = {}

/**
 * Users handlers.
 * @type {Function}
 */
handlers.users = users.init();

/**
 * Tokens handlers.
 * @type {Function}
 */
handlers.tokens = tokens.init();

/**
 * Menu handlers.
 * @type {Function}
 */
handlers.menu = menu.init();

/**
 * Carts handlers.
 * @type {Function}
 */
handlers.carts = carts.init();

/**
 * Order handlers.
 * @type {Function}
 */
handlers.order = order.init();

/**
 * Non-available endpoints.
 * @type {Function}
 */
handlers.notFound = () => Promise.resolve({
    statusCode: 404,
    responsePayload: {message: 'Request could not be processed.'},
});

// Exporting handlers.
module.exports = handlers;
