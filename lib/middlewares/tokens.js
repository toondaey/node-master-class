/**
 * Token validation middleware.
 */
// Dependencies.
const __data = require('../data');

/**
 * Token middleware function.
 * @param  {String} token
 * @param  {String} email
 * @return {Bolean}
 */
module.exports = async (token, email) => {
    // Response object.
    let response = {
        valid: false,
        status: 401,
        reason: 'No token provided.',
        token: {}
    };

    // Check that token is present.
    if (!token) return response;

    // Read token data.
    const tokenData = await __data.read('tokens', token, false);

    // Validate token is not error a.k.a. token exists.
    if (tokenData instanceof Error) {
        response.reason = 'Invalid token.'

        return response;
    }

    // Current unix timestamp.
    const time = Date.now();

    // Check if token is still refreshable
    if (time > tokenData.refreshValidity) {
        response.reason = 'Token has expired and not extendable.';

        return response;
    }

    // Validate that token has not expired.
    if (time >  tokenData.expiresIn) {
        response.reason = 'Token expired.';

        return response;
    };

    // Validate that email using token is the owner and construct validation object.
    response.valid = email ? tokenData.email === email : true;
    response = Object.assign(
        response,
        response.valid ?
            {status: 200, reason: 'Authorized', token: tokenData} :
            {status: 403, reason: 'Forbidden User'}
    );

    // Return response.
    return response;
};
