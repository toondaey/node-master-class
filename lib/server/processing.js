/**
 * Processing all server request and responses.
 */
const url = require('url'),
    { StringDecoder } = require('string_decoder'),
    util = require('util'),
    { objectify } = require('../helpers/strings'),
    logger = require('../logger'),
    debug = util.debuglog('server');

/**
 * Main container.
 * @type {Object}
 */
let lib = {};

/**
 * @description Initialize the processing.
 * @param  {Object} handlers
 * @return {Function}
 */
lib.init = handlers => {
    return (req, res) => {
        // Parse url with the boolean which will process any query string(s) that comes along.
        const parsedUrl = url.parse(req.url, true);

        // Get the pathname without query strings.
        const path = parsedUrl.pathname;

        // Fetch method which user requests.
        const method = req.method;

        // Get query string object
        const query = parsedUrl.query;

        // Get the headers as an object
        const headers = req.headers;

        // Trim path of any preceeding or succeeding slashes.
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');

        // In order to get the payload from the request we use the StreamDecoder API to reconstruct buffer.
        const decoder = new StringDecoder('utf8');

        // Processing and getting user inputed data (if any).
        let buffer = '';

        // Binding to request data event.
        req.on('data', data => {
            buffer += decoder.write(data);
        });

        // Binding to request end event
        req.on('end', async () => {
            // End of input buffer.
            buffer += decoder.end();

            // Parse buffer to payload object
            const payload = objectify(buffer),
            // Build data to send to handler.
                data = { method, query, headers, payload, trimmedPath, },
            // Check and use request handler if it exists or return a notFound handler if requested handler is not found.
                handler = trimmedPath.indexOf('public') !== -1 ? handlers['public'] : handlers[trimmedPath] ||
                    handlers.notFound;

            // Handler request and get status code and response.
            let { statusCode, responsePayload, contentType = 'json' } = await lib.handle(handler, data);

            // Process response and return status to determine debug message.
            statusCode = await lib.response(res, statusCode, responsePayload, contentType);

            // For debugging
            if (statusCode > 199 && statusCode < 300) {
                debug('\x1b[32m%s\x1b[0m', `[${statusCode}] ${method}: /${trimmedPath}`);
            } else {
                debug('\x1b[31m%s\x1b[0m', `[${statusCode}] ${method}: /${trimmedPath}`);
            }
        });
    };
};

/**
 * @description Process the response to request.
 * @param  {Object} res             Response
 * @param  {Number} statusCode
 * @param  {Object} responsePayload
 * @param  {String} contentType
 * @return {Number}                 Status code.
 */
lib.response = (res, statusCode, responsePayload, contentType = 'json') => {
    // Check if status code is correct or set a default status code
    statusCode = typeof statusCode === 'number' && statusCode || 500;

    // Content-type specific responses
    switch (contentType) {
        // Update to return content type based on the parameterized content-type
        case 'json':
            // Check that payload returned is an actual object or return an empty object
            responsePayload = typeof responsePayload === 'object' ? responsePayload : {};
            //Stringify payload.
            responsePayload = JSON.stringify(responsePayload);
            // Set content type.
            contentType = 'application/json';
            break;
        case 'html':
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload === 'string' ? responsePayload : '';
            // Set content type.
            contentType = 'text/html';
            break;
        case 'js':
            // Set content type
            contentType = 'text/javascript';
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload === 'string' ? responsePayload : '';
            break;
        case 'css':
            // Set content type
            contentType = 'text/css';
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload === 'string' ? responsePayload : '';
            break;
        case 'png':
            // Set content type
            contentType = 'image/png';
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload !== 'undefined' ? responsePayload : '';
            break;
        case 'jpeg':
            // Set content type
            contentType = 'image/jpeg';
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload !== 'undefined' ? responsePayload : '';
            break;
        case 'favicon':
            // Set content type
            contentType = 'image/x-icon';
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload !== 'undefined' ? responsePayload : '';
            break;
        default:
            // Set content type
            contentType = 'text/plain'
            // Check that payload returned is a text or return an empty text
            responsePayload = typeof responsePayload === 'string' ? responsePayload : '';
    }

    // Build response to user.
    // Set the content type so that receiver can understand the response type.
    // N.B. set header comes before writing header.
    res.setHeader('Content-Type', contentType);

    // Set the status code with the .writeHead of response.
    res.writeHead(statusCode);

    // Return response to user.
    res.end(responsePayload);

    // Return final status code for debugging.
    return statusCode;
};

/**
 * Handle requests.
 *
 * @param  {Function} handler Handler.
 * @param  {Object} data    Request data
 * @return {Promise}
 */
lib.handle = async (handler, data) => {
    try {
        // Handler request
        return await handler(data);
    } catch (e) {
        // Log error to file.
        if (e instanceof Error) logger.append('errors', e);

        debug(e);

        return e;
    }
};

// Export processing library.
module.exports = lib;
