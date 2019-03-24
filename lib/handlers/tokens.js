/**
 * Tokens handlers.
 */
// Dependencies
const {
        hash: { hash },
        strings: { randomString },
    } = require('../helpers'),
    logger = require('../logger'),
    config = require(`${__baseDir}/config`),
    { token: tokenValidation } = require('../middlewares'),
    __data = require('../data')
    util = require('util'),
    debug = util.debuglog('server');

/**
 * @description Main token container.
 * @type {Object}
 */
let lib = {};

/**
 * Expected methods.
 * @type {Array}
 */
lib.methods = ['put', 'post', 'delete'];

/**
 * @description Initialize tokens' handlers when request path is tokens.
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
        const response = await lib.__tokens[method](data);

        // Resolve if response is of success type
        if (response.statusCode > 199 && response.statusCode < 300) return resolve(response);

        // Reject otherwise.
        return reject(response);
    });
};

/**
 * Tokens handlers container for methods.
 * @type {Object}
 */
lib.__tokens = {};

/**
 * @description Create token a.k.a. Log in user.
 * @param  {Object} data Request data
 * @return {Promise}
 */
lib.__tokens.post = async data => {
    // Extract data.
    let { email, password } = data.payload;

    // Creating validation.
    email = typeof email === 'string' && email.trim().length > 0 && email;
    password = typeof password === 'string' && password.trim().length > 5 && password;

    // Validate input
    if (! (email && password))
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or inappropriately filled.'},
        };

    // Get user (if existing).
    let user = await __data.read('users', email, false);

    // Check that user actually exists.
    if (user instanceof Error) {
        // For debugging
        debug(user);

        return {
            statusCode: 401,
            responsePayload: {message: 'Invalid email or password.'},
        };
    }

    // Check user password is correct.
    if (hash(password) !== user.password)
        return {
            statusCode: 401,
            responsePayload: {message: 'Invalid email or password.'},
        };

    // Generate random string
    const token = randomString(20);

    // Validate that string token is returned by function
    if (! token) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'Random string could not be created. Check [randomString()] helper function.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'},
        };
    }

    // Current unix timestamp.
    const time = Date.now();

    // Construct token data
    let tokenData = {
        token,
        // Token is only valid for [config.sessionValidity] minutes.
        expiresIn: time + (1000 * 60 * config.sessionValidity),
        // Token can only be refreshed within [config.refreshValidity] minutes.
        refreshValidity: time + (100 * 60 * config.refreshValidity),
        email,
    };

    // Create and save new token data.
    if (await __data.create('tokens', token, tokenData)) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'Token could not be created. Check that token does not already exist or [data.create()] helper method.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'},
        };
    }

    // Update user with new token
    // Push new token to user's tokens.
    (user.tokens = user.tokens || []).push(token);

    // Update user and check for errors
    if (await __data.update('users', email, user)) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'User could not be update. Check that user exists or [data.update()] helper method.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'},
        };
    }

    // Delete unnecessary data from response
    delete tokenData.email;
    delete tokenData.refreshValidity;

    // Return response.
    return { statusCode: 200, responsePayload: { data: {...tokenData} }};
};

/**
 * @description Update token data.
 * @param  {Object} data Request object
 * @return {Promise}
 */
lib.__tokens.put = async data => {
    // Extract auth token.
    let token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Extract required data.
    let { extend } = data.payload;

    // Create validation for input
    extend = typeof extend === 'boolean' && extend;

    // Execute validation
    if (! extend)
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or inappropriately filled.'},
        };

    // Current unix timestamp.
    const time = Date.now();

    // Extend token session validity time
    validatedToken.token.expiresIn = time + (1000 * 60 * config.sessionValidity);

    // Update token in storage and check that no error is returned.
    if (await __data.update('tokens', validatedToken.token.token, validatedToken.token, false)) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'Token could not be updated. Check that token exists or [data.update()] helper method.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Could not update token.'}
        };
    }

    // Delete unnecessary data from response
    delete validatedToken.token.email;
    delete validatedToken.token.refreshValidity;

    // Return response.
    return {statusCode: 201, responsePayload: {data: {...validatedToken.token}}};
};

/**
 * @description Delete token a.k.a. logout.
 * @param  {Object} data Request data
 * @return {Promise}
 */
lib.__tokens.delete = async data => {
    // Extract data.
    let token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validatedToken = await tokenValidation(token);

    // Validate token.
    if (! validatedToken.valid)
        return {
            statusCode: validatedToken.status,
            responsePayload: {message: validatedToken.reason},
        };

    // Delete token from storage and check error.
    if (await __data.delete('tokens', validatedToken.token.token))
        return {
            statusCode: 500,
            responsePayload: {message: 'Could not delete token.'}
        }

    // Read user.
    let user = await __data.read('users', validatedToken.token.email);

    // Check that object is not an error.
    if (user instanceof Error) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'User could not be fetched. Check that user exists or [data.update()] helper method.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'}
        }
    }

    // Get index of token.
    let index = user.tokens.indexOf(validatedToken.token.token);

    // Check if token is present in user's token and delete.
    if (index !== -1) {
        // Remove token from user.
        user.tokens.splice(index, 1);

        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'Token could not be removed from user. Check that token exists in collection of user\'s tokens or [data.update()] helper method.');
    }

    // Update user while checking for error
    if (await __data.update('users', validatedToken.token.email, user)) {
        // For debugging
        debug('\x1b[31m%s\x1b[0m', 'User could not be updated. Check that user does not already exist or [data.update()] helper method.');

        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'}
        }
    }

    // Return response.
    return {statusCode: 200, responsePayload: {message: 'Token deleted.'}};
};

// Exporting module
module.exports = lib;
