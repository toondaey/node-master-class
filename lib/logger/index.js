/**
 * Logger operations.
 */
// Dependencies.

const {
        strings: { stringify },
        promisify: { open, writeFile, readFile, readdir, appendFile, truncate, gzip, unzip }
    } = require('../helpers'),
    { debuglog } = require('util'),
    debug = debuglog('logger');

/**
 * @description Main logger container.
 * @type {Object}
 */
let lib = {};

/**
 * Base directory for all logs.
 * @type {String}
 */
lib.__baseDir = `${__baseDir}/.logs`

/**
 * @description Append log to file.
 * @param  {String} fileName File to append log to.
 * @param  {Object} data     Data to be appended.
 * @return {undefined}
 */
lib.append = async (fileName, data) => {
    // Construct file path.
    fileName = `${lib.__baseDir}/${fileName}.log`;

    // Stringify data.
    data = `{"timestamp": "${(new Date).toDateString()}", "error": "${stringify(data)}"}\n`;

    try {
        // Open (or create) file for appending.
        const fileDescriptor = await open(fileName, 'a+');

        // Append new log to file.
        await appendFile(fileDescriptor, data);
    } catch (e) {
        // For debuging
        debug(e);

        // Return error to calling function.
        return e;
    }
};

/**
 * @description List all log files.
 * @param  {Boolean} includeCompressed
 * @return {Array}
 */
lib.list = async includeCompressed => {
    try {
        // Get all logger files
        let files = await readdir(`${lib.baseDir}/`);

        // Return only log files or include compressed files.
        return files
         .filter(
            file => includeCompressed ?
                    file.match(/^.*(\.log|\.b64\.gz)$/) :
                    file.match(/^.*\.log$/)
         );
    } catch (e) {
        // For debuging
        debug(e);

        // Return error to calling function.
        return e;
    }
};

/**
 * @description Compress file.
 * @param  {String}   fileName
 * @param  {String}   newFileName
 * @return {undefined}
 */
lib.compress = async (fileName, newFileName) => {
    // Construct file paths.
    const src = `${lib.__baseDir}/${fileName}.log`,
        dest = `${lib.__baseDir}/${newFileName}.b64.gz`;

    try {
        // Read content of source file.
        const data = await readFile(`${src}`),
            // Compress content of source file.
            buffer = await gzip(data),
            // Open destination file for compression.
            fileDescriptor = await open(`${dest}`, 'wx');

        // truncate source for new logs.
        await truncate(`${src}`);

        // Write compressed content to new file.
        await writeFile(fileDescriptor, buffer.toString('base64'));
    } catch (e) {
        // For debuging
        debug(e);

        // Return error to calling function.
        return e;
    }
};

lib.decompress = async file => {
    // Construct file path.
    file = `${lib.__baseDir}/${file}.b64.gz`;

    try {
        // Read compressed content from file.
        const content = await readFile(file, 'utf8'),
            // Read buffer of content as base 64 encoded.
            data = Buffer.from(content, 'base64');

        // Return unzipped content.
        return await unzip(data);
    } catch (e) {
        // For debuging
        debug(e);

        // Return error to calling function.
        return e;
    }
};

// Exporting logger.
module.exports = lib;
