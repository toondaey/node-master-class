/**
 * All request handlers and corresponding operations.
 */
// Dependencies
const apis = require('./apis'),
    web = require('./web');

/**
 * @description Main handlers container.
 * @type {Object}
 */
let handlers = { ...apis, ...web }

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
