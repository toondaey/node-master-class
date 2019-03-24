/**
 * Mail helpers.
 */
// Dependendies
const https = require('https'),
    { objectify, toQueryString } =  require('./strings'),
    config = require(`${__baseDir}/config`);

/**
 * @description Main mail helper container.
 * @type {Function}
 */
let lib = {};

/**
 * @description Sending emails
 * @type {Function}
 */
lib.mail = (to, subject, text, cb) => {
    const payload = {
        from: config.mailgun.from,
        to: config.environment !== 'production' ?
            config.mailgun.sandBoxEmails.join(', ') :
            to,
        subject,
        text
    };

    // Configure request details.
    const stringPayload = toQueryString(payload);

    // Craft request details.
    const requestDetails = {
        hostname: config.mailgun.baseUrl,
        method: 'POST',
        path: `/v3/${config.mailgun.domain}/messages`,
        auth: `api:${config.mailgun.keys.secret}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload),
        }
    };

    // Create the request
    let req = https.request(requestDetails, res =>
        // Bind data event to response.
        res.on('data', buffer => {
            // Parse data to object
            const data = objectify(buffer);

            // Check that response is a success.
            if (res.statusCode > 199 && res.statusCode < 300) return cb(null, data);

            // Create error for failed charge
            let error = new Error('Unable to send mail.');

            // Extend error
            error.verbose = data

            return cb(error);
        })
    );

    // Bind to the error event so thread doesn't stop
    req.on('error', e => cb(e));

    // Bind to the timeout event so thread doesn't stop
    req.on('timeout', e => cb(e));

    // Add payload to request.
    req.write(stringPayload);

    // End request
    req.end();
};

// Exporting...
module.exports = lib;
