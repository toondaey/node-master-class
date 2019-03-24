/**
 * Carts handlers.
 */
// Dependencies
const __data = require('../../data'),
    { token: tokenValidation } = require('../../middlewares');

/**
 * @description Carts main container.
 * @type {Object}
 */
let lib = {};

/**
 * Expected methods.
 * @type {Array}
 */
lib.methods = ['get', 'put', 'post', 'delete'];

/**
 * @description Initialize carts' handlers when request path is carts.
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
        const response = await lib.__carts[method](data);

        // Resolve if response is of success type
        if (response.statusCode > 199 && response.statusCode < 300) return resolve(response);

        // Reject otherwise.
        return reject(response);
    });
};

/**
 * Carts handlers container for methods.
 * @type {Object}
 */
lib.__carts = {};

/**
 * @description Post new item to cart or update existing one.
 * @param  {Object} data Request Object
 * @return {Promise}
 */
lib.__carts.post = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Extract required item
    let { menu_id, qty } = data.payload;

    // Create validation for item
    qty = typeof qty === 'number' && qty % 1 === 0 && qty;
    menu_id = typeof menu_id === 'string' && menu_id.trim().length > 0 && menu_id.trim();

    // Validate item
    if (! (qty && menu_id))
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        };

    // Read menu from storage
    const menu = await __data.read('menu', 'default');

    // Check that menu is not an error
    if (menu instanceof Error)
        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'},
        };

    // Item placeholder.
    let item;

    // Get menu item by id or return not found if not present
    if (! (item = menu.find(item => item.menu_id === menu_id)))
        return {
            statusCode: 404,
            responsePayload: { message: 'Menu item not found' },
        };

    // Get existing cart if any
    let cart = await __data.read('carts', validatedToken.token.email, false);

    // Validate that returned cart is not an error
    cart = cart instanceof Error ? [] : cart;

    // If cart has items find it, otherwise default to an empty cart.
    item = cart.length && cart.find(item => item.menu_id === menu_id) || item;

    // Alter quantity
    item.qty = qty;

    // Find index of item and update.
    // Get index of item in cart.
    let index = cart.findIndex(el => el.menu_id === item.menu_id);

    // Update item if already exists
    if (index !== -1) cart.splice(index, 1, item);
    // Push to cart if it does not exist.
    else cart.push(item);

    __data.update('carts', validatedToken.token.email, cart);

    // Return cart.
    return {
        statusCode: 200,
        responsePayload: {message: 'Cart updated.', cart}
    };
};

/**
 * @description Update existing item in cart.
 * @param  {Object} data Request data.
 * @return {Promise}
 */
lib.__carts.put = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Extract required item content
    let { action } = data.payload,
        { menu_id } = data.query;

    // Create validation for item.
    menu_id = typeof menu_id === 'string' && menu_id.trim().length > 0 && menu_id.trim();
    action = typeof action === 'string' && ['incr', 'decr'].indexOf(action.trim()) > -1 && action.trim();

    // Validate item
    if (! (menu_id && action))
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        };

    // Get cart if exists.
    let cart = await __data.read('carts', validatedToken.token.email, false);

    // Validate that returned cart is not an error
    cart = cart instanceof Error ? [] : cart;

    // Get item in cart (if exists) for updating.
    let item = cart.find(item => item.menu_id === menu_id);

    if (item && action === 'incr') {
        item.qty += 1;

        cart.splice(cart.findIndex(el => el.menu_id === item.menu_id), 1, item);
    } else if (item && action === 'decr') {
        item.qty -= 1;

        if (item.qty) cart.splice(cart.findIndex(el => el.menu_id === item.menu_id), 1, item);
        else cart.splice(cart.findIndex(el => el.menu_id === item.menu_id), 1);
    } else {
        return {
            statusCode: 400,
            responsePayload: { message: 'Cannot add to or remove from a non-existing item.', cart },
        };
    }

    if (await __data.update('carts', validatedToken.token.email, cart))
        return {
            statusCode: 500,
            responsePayload: {message: 'Could not update cart'}
        };

    return {
        statusCode: 201,
        responsePayload: {message: 'Cart updated', cart}
    };
};

/**
 * @description Delete existing item from cart.
 * @param  {Object} data Request data.
 * @return {Promise}
 */
lib.__carts.delete = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Extract data
    let { menu_id } = data.query;

    // Create validation.
    menu_id = typeof menu_id === 'string' && menu_id.trim().length > 0 && menu_id.trim();

    // Execute validation.
    if (! menu_id)
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        };

    // Get cart.
    let cart = await __data.read('carts', validatedToken.token.email, false);

    // Validate that returned cart is not an error
    cart = cart instanceof Error ? [] : cart;

    // Item placeholder
    let item;

    // Get item from cart
    if (! (item = cart.find(item => item.menu_id === menu_id)))
        return {
            statusCode: 404,
            responsePayload: {message: 'Menu item not found in cart.'}
        };

    // Remove menu item from cart.
    cart.splice(cart.findIndex(el => el.menu_id === item.menu_id), 1);

    // Update cart in storage
    if (await __data.update('carts', validatedToken.token.email, cart))
        return {
            statusCode: 500,
            responsePayload: {message: 'Could not update cart'}
        };

    // Return feedback and cart;
    return { statusCode: 201, responsePayload: {message: 'Cart updated!', cart} };
};

/**
 * @description Get a user's cart.
 * @param  {Object} data Request data object
 * @return {Promise}
 */
lib.__carts.get = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Get cart.
    let cart = await __data.read('carts', validatedToken.token.email, false);

    // Validate that returned cart is not an error
    cart = cart instanceof Error ? [] : cart;

    // Return cart.
    return {statusCode: 200, responsePayload: {data: cart}};
};

// Export module.
module.exports = lib;
