/**
 * Payment helper(s).
 */
// Dependencies...
const https = require('https'),
    { toQueryString, objectify } = require('./strings');
    config = require(`${__baseDir}/config`);

/**
 * Main payment helper container.
 * @type  {Object}
 */
let lib = {};

/**
 * The tokens API
 * @type {Object}
 */
lib.token = {};

/**
 * @description Create a token for charging a paymant.
 * @param {Object} data Data object.
 * @param {Function } cb
 * @return {Function} [description]
 */
lib.token.create = (data, cb) => {
    // Get data for validation.
    let { card: {exp_month, exp_year, number, cvc,} } = data;

    // Create the validation
    exp_month = (typeof exp_month === 'string' || typeof exp_month === 'number') && String(exp_month).length === 2 && Number(exp_month) > 0 && Number(exp_month) < 13 && exp_month;
    exp_year = (typeof exp_year === 'string' || typeof exp_year === 'number') && String(exp_year).match(/^(\d{2}|\d{4})$/) && Number(exp_year) > 0 && exp_year;
    number = typeof number === 'string' && number.trim().length === 16 && number.trim();
    cvc = typeof cvc === 'string' && Number(cvc) && cvc;

    // Validate data
    if (! (exp_month && exp_year && number && cvc))
        return cb(new Error('Card data appears to be invalide.'));

    // Override card details.
    data.card = Object.assign(data.card, { exp_month, exp_year, number, cvc, });

    // Stringify payload.
    const stringPayload =  toQueryString(data);

    // Craft request object.
    const requestDetails = lib.__helpers.requestCrafter(stringPayload, '/v1/tokens');

    // Https request handler.
    const req = https.request(requestDetails, res =>
        // Bind data event to response.
        res.on('data', buffer => {
            // Parse data to object
            const data = objectify(buffer);

            // Check that response is a success.
            if (res.statusCode > 199 && res.statusCode < 300) return cb(null, data);

            // Create error for failed charge
            let error = new Error('Unable to create token for card.');

            // Extend error
            error.verbose = data

            return cb(error);
        })
    );

    // Bind request to timeout.
    req.on('timeout', e => cb(e));

    // Bind request to error
    req.on('error', e => cb(e));

    // Write payload to request.
    req.write(stringPayload);

    // Invoke request.
    req.end();
};

/**
 * The charges API.
 * @type {Object}
 */
lib.charge = {};

/**
 * @description Create a charge for order.
 * @param {Object} data Charge object.
 * @param {Function} cb
 * @return {Function}
 */
lib.charge.create = (data, key, cb) => {
    // Get data for validation.
    let { amount, source, currency } = data;

    // Create the validation
    amount = typeof amount === 'number' && amount > 0.49 && amount;;
    source = typeof source === 'string' && source.length && source && config.environment === 'production' && source || 'tok_visa';
    currency = typeof currency === 'string' && currency.match(/^\w{3}$/) && currency;

    // Execute validation.
    if (! (amount && source && currency))
        return cb(new Error('Some required fields appear to be missing'));

    // Check if idempotency key is provided.
    if (typeof key === 'function') cb = key;

    // Query string of payload with amount converted to zero-decimal currency.
    const stringPayload = toQueryString( Object.assign(data, {amount: amount * 100, source, currency}) );

    // Include idempotency key in header if provided.
    const headers = typeof key !== 'function' ?  {'Idempotency-Key': key} : {};

    // Craft request details.
    const requestDetails = lib.__helpers.requestCrafter(
        stringPayload,
        '/v1/charges',
        'POST',
        { headers }
    );

    // Https request handler.
    const req = https.request(requestDetails, res =>
        // Bind data event to response.
        res.on('data', buffer => {
            // Parse data to object
            const data = objectify(buffer);

            // Check that response is a success.
            if (res.statusCode > 199 && res.statusCode < 300) return cb(null, data);

            // Create error for failed charge
            let error = new Error('Unable to charge card.');

            // Extend error
            error.verbose = data

            return cb(error);
        })
    );

    // Bind request to error
    req.on('error', e => cb(e));

    // Bind request to error
    req.on('error', e => cb(e));

    // Write payload to request.
    req.write(stringPayload);

    // Invoke request.
    req.end();
};

/**
 * Internal helpers.
 * @type {Object}
 */
lib.__helpers = {};

/**
 * @description An internal helper to craft request details.
 * @param  {String} path
 * @param  {String} method
 * @param  {Object} additionalOptions
 * @return {Object}
 */
lib.__helpers.requestCrafter = (stringPayload, path, method = 'POST', additionalOptions = {}) => {
    return {
        hostname: config.stripe.baseUrl,
        method,
        path,
        auth: `${config.stripe.keys.secret}:`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload),
        },
        ...additionalOptions,
    };
};

// Exporting...
module.exports = lib;
