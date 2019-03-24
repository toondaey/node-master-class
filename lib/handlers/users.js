/**
 * The users handlers.
 */
// Dependencies.
const { hash: { hash } } = require('../helpers'),
    { token: tokenValidation } = require('../middlewares'),
    __data = require('../data');

/**
 * Users handers container.
 * @type {Object}
 */
let lib = {};

/**
 * Expected methods.
 * @type {Array}
 */
lib.methods = ['get', 'put', 'post', 'delete'];

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
            return reject({statusCode: 404, responsePayload: {message: 'Request could not be processed.'}});

        // Pass data to appropriate handler.
        const response = await lib.__users[method](data);

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
lib.__users = {};

lib.__users.get = async data => {
    // Extract content.
    const token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validateToken = await tokenValidation(token);

    // Validate token.
    if (! validateToken.valid)
        return {
            statusCode: validateToken.status,
            responsePayload: {message: validateToken.reason},
        };

    // Get user's content.
    const user = await __data.read('users', validateToken.token.email, false);

    // Check that user is not an error.
    if (user instanceof Error)
        return {
            statusCode: 404,
            responsePayload: { message: 'User not found.' },
        }

    // Delete data that shouldn't be public.
    delete user.password;
    delete user.tokens;
    delete user.orders;

    // Return user
    return {
        statusCode: 200,
        responsePayload: { data: {...user} },
    }
}

/**
 * @description Create a new user.
 *
 * @param  {Object} data Request data.
 * @return {Object}      Response object.
 */
lib.__users.post = async data => {
    // Extract payload content.
    let { firstName, lastName, email, address, password } = data.payload;

    // Create validation for user's input.
    firstName = typeof firstName === 'string' && firstName.trim().length > 4 && firstName.trim();
    lastName = typeof lastName === 'string' && lastName.trim().length > 4 && lastName.trim();
    email = typeof email === 'string' && email.trim().length > 0 && email;
    address = typeof address === 'string' && address.trim().length > 0 && address;
    password = typeof password === 'string' && password.trim().length > 5 && password;

    // Validate user's input.
    if (! (firstName && lastName && email && address && password))
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        };

    // Create new user object.
    let user = { firstName, lastName, email, address };

    // Create hashed password.
    if (! (user.password = hash(password)))
        return {statusCode: 500, responsePayload: {message: 'Something went wrong.'}};

    // Save new user in storage.
    // Check if error is returned.
    if (await __data.create('users', email, user))
        return {statusCode: 400, responsePayload: {message: 'User already exist.'}};

    // Delete password from response.
    delete user.password;

    // return new without hashed password
    return { statusCode: 200, responsePayload: {data: user} };
};

/**
 * @description Put handler.
 * @param  {Object} data Request data.
 * @return {Promise}
 */
lib.__users.put = async data => {
    // Extract payload content.
    let { firstName, lastName, address, password } = data.payload,
        { email } = data.query,
        token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validateToken = await tokenValidation(token, email);

    // Validate token.
    if (! validateToken.valid)
        return {
            statusCode: validateToken.status,
            responsePayload: {message: validateToken.reason},
        };

    // Create validation for user's input.
    firstName = typeof firstName === 'string' && firstName.trim().length > 4 && firstName.trim();
    lastName = typeof lastName === 'string' && lastName.trim().length > 4 && lastName.trim();
    email = typeof email === 'string' && email.trim().length > 0 && email;
    address = typeof address === 'string' && address.trim().length > 0 && address;
    password = typeof password === 'string' && password.trim().length > 5 && password;

    // Validate user's input.
    if (! (firstName || lastName || address || password) || ! email)
        return {
            statusCode: 422,
            responsePayload: {message: 'At least one field must be filled appropriately.'},
        };

    // Read users content
    let user = await __data.read('users', email, false);

    // Check that user is returned and not error
    if (user instanceof Error)
        return {
            statusCode: 400,
            responsePayload: {message: 'User does not exist.'},
        };

    // Update data based on existence of data.
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;

    // Create hashed password.
    if (password && ! (user.password = hash(password)))
        return {
            statusCode: 500,
            responsePayload: {message: 'Something went wrong.'}
        };

    // Update user data and check if error is returned.
    if (await __data.update('users', email, user))
        return {
            statusCode: 500,
            responsePayload: {message: 'Unable to update user data.'}
        };

    // Delete user's password.
    delete user.password

    // Return response
    return { statusCode: 200, responsePayload: {data: user} };
};

/**
 * @todo  Delete all users items.
 *
 * @decription Delete handler.
 * @param  {Object} data Request data.
 * @return {Promise}
 */
lib.__users.delete = async data => {
    // Extract required data.
    let { email } = data.query,
        token = data.headers['x-auth-token'];

    // Authenticate token for action.
    const validateToken = await tokenValidation(token, email);

    // Validate token.
    if (! validateToken.valid)
        return {
            statusCode: validateToken.status,
            responsePayload: {message: validateToken.reason},
        };

    // Create validation for input
    email = typeof email === 'string' && email.trim().length > 0 && email;

    // Validate email.
    if (! email)
        return {
            statusCode: 422,
            responsePayload: {message: 'Some required fields are either missing or incorrectly filled.'}
        };

    // Read user and delete user-affiliated content.
    // Read user.
    let user = await __data.read('users', email, false);

    // Vet user's data.
    if (user instanceof Error)
        return {
            statusCode: 400,
            responsePayload: {message: 'User does not seem exist.'},
        };

    // Count all user's tokens.
    let tokensCount = (user.tokens = user.tokens || []).length;
    tokensDeleted = 0;

    // Delete all user's tokens.
    user.tokens.forEach(token => {
        // Delete token.
        __data.delete('tokens', token);

        // Increment tokensDeleted
        ++tokensDeleted;
    });

    // Check that delete is done.
    if (await __data.delete('users', email))
        return {
            statusCode: 500,
            responsePayload: {message: 'User does not seem exist.'},
        };

    // Delete user's cart if already exists.
    // No error check because it may not yet exist.
    __data.delete('carts', email, false);

    // Return response.
    return {
        statusCode: 200,
        responsePayload: {
            message: tokensCount === tokensDeleted ?
                    'User deleted.' :
                    'User deleted but some of user\'s items may not be deleted.'
        }
    };
};

// Exporting module
module.exports = lib;
