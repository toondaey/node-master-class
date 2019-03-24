/**
 * Template retreiver.
 */
// Dependencies...
const path = require('path'),
    config = require('../../config'),
    fs = require('fs');

/**
 * @description Main container
 * @type {Object}
 */
let lib = {};

/**
 * Get templates.
 * @param  {String}   name
 * @param {Object} data
 * @param  {Function} cb
 * @return {undefined}
 */
lib.getTemplate = (name, cb) => {
    // Validate template name.
    if (typeof name !== 'string' && name.trim().length < 1) return cb(new Error('Invalid template name'));

    // Construct  template home directory
    const templateHome = path.join(__dirname, '../../templates');

    // Read in template content.
    fs.readFile(`${templateHome}/${name}.html`, 'utf8', (err, content) => cb(err, content));
};

lib.mergeAllTemplates = (bodyContent, data, cb) => {
    // Get globals
    const globals = config.globals;

    // Concatenate all data (including the global data) into one.
    data = { globals, ...data };

    // Get header template.
    lib.getTemplate('_header', (err, headerContent) => {
        if (err) return cb(err);

        // Get footer template.
        lib.getTemplate('_footer', (err, footerContent) => {
            if (err) return cb(err);

            // Concatenate all pages.
            let page = `${headerContent}${bodyContent}${footerContent}`
            // Get all keys from within the concatenated pages.
                , keys = page.match(/\{{1}(.+?)\}{1}/g)
            // Placeholders for all undefined errors.
                , errors = [];

            // We loop through the extracted keys and
            // get their corresponding values
            // from the data object.
            for (let key in keys) {
                // Set key to the key from page
                key = keys[key];

                // Placeholders and key formatting for [eval] method.
                let value, pattern, k = key.replace(/^\{+|\}+$/g, '');

                try {
                    // Use eval method to get the value from data object.
                    value = eval(`data.${k}`);

                    // We throw an error for values that are undefined.
                    if (typeof value === 'undefined') throw new ReferenceError(`${k} is undefined.`);
                } catch (e) {
                    // Return errors for values that are undefined
                    // or in case of other unforseeable errors.
                   return cb(e instanceof ReferenceError ? `${k} is undefined.` : e.message);
                }

                // Construct regular expression pattern to fix value(s) in page.
                pattern = new RegExp(key, 'ig');

                // Replace pattern(s) with values in page.
                page = page.replace(pattern, value);
            }

            // Return no error and page.
            cb(null, page);
        });
    });
};

/**
 * @description Fetch static files.
 * @param  {String}   fileName
 * @param  {Function} cb
 * @return {undefined}
 */
lib.getStaticAsset = (fileName, cb) => {
    // Check that file name is valid.
    if (typeof fileName !== 'string' && fileName.length < 1)
        return cb(new Error('Invalid file name.'));

    // We use file system to retrieve the file content.
    fs.readFile(
        `${__baseDir}/public/${fileName}`,
        'utf8', (err, content) => cb(err, content)
    );
};

// Exporting
module.exports = lib;
