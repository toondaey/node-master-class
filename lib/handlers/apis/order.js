/**
 * Orders Handler
 */
// Dependencies
const __data = require('../../data'),
    {
        strings: { randomString },
        promisify: { createPaymentToken, createPaymentCharge, sendMail, },
    } = require('../../helpers'),
    { token: tokenValidation } = require('../../middlewares'),
    { debuglog } = require('util'),
    debug = debuglog('server');

/**
 * Users handers container.
 * @type {Object}
 */
let lib = {};

/**
 * Expected methods.
 * @type {Array}
 */
lib.methods = ['get', 'post'];

/**
 * @description Initialize users' handlers when request path is users.
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
            return reject({ statusCode: 404, responsePayload: { message: 'Request could not be processed.' } });

        // Pass data to appropriate handler.
        const response = await lib.__orders[method](data);

        // Resolve if response is of success type
        if (response.statusCode > 199 && response.statusCode < 300) return resolve(response);

        // Reject otherwise.
        return reject(response);
    });
};

/**
 * Users handlers container for methods.
 * @type {Object}
 */
lib.__orders = {};

/**
 * List of possible order states.
 * @type {Array}
 */
lib.__orders.states = ['pending', 'processing', 'fulfilled'];

/**
 * Calculate user's cart and create an order from it.
 * @param  {Object} data Request data object
 * @return {Promise}
 */
lib.__orders.get = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (!validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: { message: validatedToken.reason },
        };

    // Get cart (if any) of authenticated users
    const cart = await __data.read('carts', validatedToken.token.email, false);

    // Validate that cart is not an error.
    if (cart instanceof Error)
        return {
            statusCode: 500,
            responsePayload: {message: 'Cart could not be fetched.'}
        };

    // Check that cart is not empty.
    if (! cart.length)
        return {
            statusCode: 400,
            responsePayload: {message: 'Cart is empty'},
        };

    // Create intended file name a.k.a. order_id
    const name = Date.now() + randomString();

    // Order placeholder.
    const order = {
        order: [],
        amount: 0,
        owner: validatedToken.token.email
    };

    // Calculate order amount.
    order.amount = cart.reduce((total, item) => total += item.price, 0);
    order.order = cart;
    order.id = name;

    // Save new order
    if (await __data.create('orders/pending', name, order))
        return {
            statusCode: 500,
            responsePayload: { message: 'Order could not be saved, please try again.' }
        };

    // Add order to user's list of order.
    let user = await __data.read('users', validatedToken.token.email, false);

    // Check that user is not an error
    if (user instanceof Error)
        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong!'},
        };

    // Get users order to push new order in.
    user.orders = user.orders || [];

    // Push new order on to orders list.
    user.orders.push({order: name, state: lib.__orders.states[0]});

    // Update user's orders
    if (await __data.update('users', validatedToken.token.email, user))
        return {
            statusCode: 500,
            responsePayload: { message: 'Something went wrong!' },
        };

    // Clear out user's cart
    if (await __data.update('carts', validatedToken.token.email, []))
        return {
            statusCode: 206,
            responsePayload: {
                message: 'Order saved successfully. But user\'s cart may still be filled.',
                data: order
            }
        };

    // Remove owner from response
    delete order.owner;

    return {
        statusCode: 200,
        responsePayload: {message: 'Order saved successfully.', data: order}
    };
};

/**
 * @description User completes order.
 * @param  {Object} data Request data object.
 * @return {Promise}
 */
lib.__orders.post = async data => {
    // Extract token
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (!validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: { message: validatedToken.reason },
        };

    // Declare placeholders for required fields.
    let number, exp_month, exp_year, cvc, currency, order_id, resCharge, resToken;

    // Extract required data.
    try {
        ({ number, exp_month, exp_year, cvc, currency, order_id } = data.payload);
    } catch (e) {
        debug(e);

        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        }
    }

    // Create validation for charge.
    order_id = typeof order_id === 'string' && order_id.trim().length === 23 && order_id.trim();
    number = typeof number === 'string' && number.trim().length === 16 && number.trim();
    exp_month = (typeof exp_month === 'string' || typeof exp_month === 'number') && String(exp_month).length === 2 && Number(exp_month) > 0 && Number(exp_month) < 13 && exp_month;
    exp_year = (typeof exp_year === 'string' || typeof exp_year === 'number') && String(exp_year).match(/^(\d{2}|\d{4})$/) && Number(exp_year) > 0 && exp_year;
    cvc = typeof cvc === 'string' && Number(cvc) && cvc;
    currency = typeof currency === 'string' && currency.match(/^\w{3}$/) && currency || 'usd';

    // Execute validation.
    if (! (number && exp_month && exp_year && cvc && currency))
        return {
            statusCode: 422,
            responsePayload: { message: 'Some required fields are either missing or incorrectly filled.' }
        };

    // Read order and validate that it belongs to user.
    // Read order.
    const order = await __data.read(`orders/${lib.__orders.states[0]}`, order_id, false);

    // Check that order is not an error
    if (order instanceof Error)
        return {
            statusCode: 404,
            responsePayload: { message: 'Order does not exist.' },
        }

    // Read user.
    let user = await __data.read('users', validatedToken.token.email, false);

    // Check that user is not an error
    if (user instanceof Error)
        return {
            statusCode: 500,
            responsePayload: {message: 'Could not read user!'},
        };

    // Get order index from users orders.
    const orderIndex = (user.orders || []).findIndex(val => order_id === val.order);

    // Validate that order belongs to user
    if (order.owner !== validatedToken.token.email || orderIndex === -1)
        return {
            statusCode: 403,
            responsePayload: { message: 'Order does not belong to user.' },
        };

    // Check that order is not already fulfilled.
    if (user.orders[orderIndex].state === lib.__orders.states[1])
        return {
            statusCode: 400,
            responsePayload: { message: 'Order already being processed.' },
        };

    try {
        // Generate a token for card.
        debug('Creating token...')
        resToken = await createPaymentToken({ card: { exp_month, exp_year, number, cvc } });

        // Charge order.
        debug('Creating charge...')
        resCharge = await createPaymentCharge({ source: resToken.card, amount: order.amount, currency }, order_id);
    } catch (e) {
        // For debugging...
        debug(e);

        return {
            statusCode: 400,
            responsePayload: {message: e.verbose ? e.message : 'Could not charge card.'}
        }
    }

    // For debugging...
    debug(resToken, resCharge);

    // Send mail to customer of success charge.
    sendMail(
        validatedToken.token.email,
        'Payment successful.',
        `Your payment has been received successfully, and your order <b>${order_id}</b> is being processed.\nPizza should be delivered in the next 30 minutes.`
    );

    debug('Updating user\'s orders...');
    // Update order status in user's orders.
    user.orders[orderIndex].state = lib.__orders.states[1];

    // Update an validate that it does not return
    if (await __data.update('users', validatedToken.token.email, user))
        return {
            statusCode: 500,
            responsePayload: { message: 'User\'s order could not updated.' },
        }

    debug('Moving file from pending to processing...');
    // Move file to fulfilled orders directory for future processing...
    if (await __data.copyFile(
        `orders/${lib.__orders.states[0]}`,
        `orders/${lib.__orders.states[1]}`,
        order_id,
        {'-m': true})
    )
        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'}
        };

    return {
        statusCode: 200,
        responsePayload: { message: 'Thank you for your patronage.\nYour order is being processed and should be delivered in 30 mintues.' }
    };
};

// Export library
module.exports = lib;
