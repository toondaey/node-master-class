/**
 * Menu handler
 */
// Dependencies
const __data = require('../../data'),
    { debuglog } = require('util'),
    debug = debuglog('server');

/**
 * @description Carts main container.
 * @type {Object}
 */
let lib = {};

/**
 * Expected methods.
 * @type {Array}
 */
lib.methods = ['get'];

/**
 * @description Initialize menu' handlers when request path is menu.
 * @param  {Object} data
 * @return {Function}
 */
lib.init = data => async data => {
    // Extract method from data
    let { method } = data;

    return new Promise(async (resolve, reject) => {
        // Check if appropriate method is called.
        if (lib.methods.indexOf(method = method.toLowerCase()) === -1)
            // Reject response if method does not exist.
            return reject({statusCode: 404, responsePayload: {message: 'Request could not be processed.'}});

        // Pass data to appropriate handler.
        const response = await lib.__menu[method](data);

        // Resolve if response is of success type
        if (response.statusCode > 199 && response.statusCode < 300) return resolve(response);

        // Reject otherwise.
        return reject(response);
    });
};

/**
 * Menu handlers container for methods.
 * @type {Object}
 */
lib.__menu = {};

/**
 * @description Get menu items.
 * @param  {Object} data Request object
 * @return {Promise}
 */
lib.__menu.get = async data => {
    // Get menu from storage
    const menu = await __data.read('menu', 'default');

    // Check that menu returned is not an error.
    if (menu instanceof Error)
        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'}
        };

    // Return Menu.
    return {
        statusCode: 200,
        responsePayload: {
            data: menu
        }
    }
};

// Exporting...
module.exports = lib;
