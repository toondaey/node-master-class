/**
 * Main web module file.
 */
// Dependencies...
const {
        promisify: { getTemplate, mergeAllTemplates, getStaticAsset }
    } = require('../../helpers')
    logger = require('../../logger'),
    __data = require('../../data');

/**
 * @description Main container
 * @type {Object}
 */
let lib = {};

/**
 * @description Defining the content types.
 * @type    {Object}
 */
lib.__contentTypes = {
    html: 'html',
    png: 'png',
    jpeg: 'jpeg',
    css: 'css',
    js: 'js',
    plain: 'plain',
    favicon: 'favicon',
};

/**
 * @description Index page.
 * @type    {Function}
 * @param {Object} data Request object
 * @return {Promise}
 */
lib[''] = data => {
    // Construct response body.
    const bodyData = {
        body: {
            main: 'Pizza at your doorstep.',
            class: 'index'
        },
        head: {
            title: 'Welcome',
            description: 'We sell pizza'
        }
    };

    return lib.__get(data, 'index', bodyData);
};

/**
 * @description Login page
 * @param  {Object} data Request Object.
 * @return {Promise}
 */
lib.login = data => {
    // Construct body data.
    const bodyData = {
        head: {
            title: 'Login',
            description: 'Log in to your account.'
        },
        body: {
            class: 'login'
        }
    };

    return lib.__get(data, 'login', bodyData)
};

/**
 * @description Signup page
 * @param  {Object} data Request Object.
 * @return {Promise}
 */
lib.signup = data => {
    // Construct body data.
    const bodyData = {
        head: {
            title: 'Sign up',
            description: 'Sign up for a new account.'
        },
        body: {
            class: 'signup'
        }
    };

    return lib.__get(data, 'signup', bodyData)
}

/**
 * @description Menu page.
 * @param  {Object} data Request Object.
 * @return {Promise}
 */
lib.menu = data => {
    // Construct body data.
    const bodyData = {
        head: {
            title: 'Menu',
            description: 'Sign up for a new account.'
        },
        body: {
            class: 'menu'
        }
    };

    return lib.__get(data, 'menu', bodyData)
}

/**
 * @description Cart page.
 * @param  {Object} data Request Object.
 * @return {Promise}
 */
lib.cart = data => {
    // Construct body data.
    const bodyData = {
        head: {
            title: 'Cart',
            description: 'Sign up for a new account.'
        },
        body: {
            class: 'cart'
        }
    };

    return lib.__get(data, 'cart', bodyData)
}

/**
 * @description Checkout page.
 * @param  {Object} data Request Object.
 * @return {Promise}
 */
lib.checkout = async data => {
    // Extract data.
    const { order_id } = data.query;

    // We retrieve the order to verify it's existence.
    // const order = await __data.read('orders/pending', order_id, false);

    // if (!order || (order &&  (order instanceof Error))) {
    //     return {
    //         statusCode: 404,
    //         responsePayload: mergedTemplate,
    //         contentType: lib.__contentTypes.html,
    //     };
    // }

    // Construct body data.
    const bodyData = {
        head: {
            title: 'Checkout',
            description: 'Sign up for a new account.'
        },
        body: {
            class: 'checkout'
        }
    };

    return lib.__get(data, 'checkout', bodyData)
}

/**
 * @description Universal get function.
 * @param  {Object} data     Request object.
 * @param  {String} template Template name.
 * @param  {Obect} bodyData  Template body data.
 * @return {Promise}
 */
lib.__get = async (data, template, bodyData) => {

    // Extract method.
    const { method } = data;

    // Return promise for data processing.
    return new Promise( async (resolve, reject) => {
        // Check that only allowable methods are permitted.
        if (method.toLowerCase() !== 'get') return reject({
            statusCode: 404, responsePayload: { error: 'Request could not be processed.'}
        });

        // Get the main template
        const mainTemplate = await getTemplate(template);

        // Merge main template with other templates.
        const mergedTemplate = await mergeAllTemplates(mainTemplate, bodyData);

        // Return promised response.
        return resolve({
            statusCode: 200,
            responsePayload: mergedTemplate,
            contentType: lib.__contentTypes.html,
        });
    });
}

/**
 * @description Static assets.
 * @type    {Function}
 * @param {Obect} data Request object.
 * @return {Promise}
 */
lib.public = async (data) => {
    // Extract method.
    const { method } = data;

    // Return promise for data processing.
    return new Promise( async (resolve, reject) => {
        // Check that only allowable methods are permitted.
        if (method.toLowerCase() !== 'get') return reject({
            statusCode: 404, responsePayload: { message: 'Request could not be processed.'}
        });

        try {
            // Extract the asset name.
            const assetName = data.trimmedPath.replace('public/', '')
            // Fetch the content of the requested asset.
                , content = await getStaticAsset(assetName);

            // Placeholder for the mimetype
            let contentType;

            // Determine the content type to be returned.
            if (/\.js$/.test(assetName)) contentType = lib.__contentTypes.js;
            else if (/\.css$/.test(assetName)) contentType = lib.__contentTypes.css;
            else if (/\.png$/.test(assetName)) contentType = lib.__contentTypes.png;
            else if (/\.jpe?g$/.test(assetName)) contentType = lib.__contentTypes.jpeg;
            else if (/\.favicon$/.test(assetName)) contentType = lib.__contentTypes.favicon;
            else contentType = lib.__contentTypes.plain;

            resolve({
                statusCode: 200,
                responsePayload: content,
                contentType
            });
        } catch (e) {
            // Log error
            logger.append('errors', e);

            reject({
                statusCode: 404,
                responsePayload: 'File not found',
                contentType: lib.__contentTypes.plain,
            })
        }
    });
};

// Exporting module...
module.exports = lib;
