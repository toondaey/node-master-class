/**
 * Data persistence processing.
 */
// Dependencies.
const fs = require('fs'),
    {
        strings: { objectify },
        promisify: { open, writeFile, readFile, truncate, readdir, unlink, copyFile, stat }
    } = require('../helpers'),
    logger = require('../logger'),
    { debuglog } = require('util'),
    debug = debuglog('data');

/**
 * @description Main container.
 */
let lib = {};

/**
 * @description Base directory.
 * @type {String}
 */
lib.__baseDir = `${__baseDir}/.data`;

/**
 * @description Create new user.
 * @param {String} dir Directory.
 * @param {String} file File to write to.
 * @param {Object} data Data object to be written.
 * @param {Function} cb Callback for feedback.
 * @param {Boolean} logError
 * @return {undefine}
 */
lib.create = async (dir, file, data, logError = true) => {
    // Construct directory and data
    file = `${lib.__baseDir}/${dir}/${file}`;

    // Wrap in try catch block for await errors.
    try {
        data = typeof data === 'string' ? data : JSON.stringify(data);

        // Open (create) file for reading
        const fileDescriptor = await open(`${file}.json`, 'wx');

        // Write to file
        await writeFile(fileDescriptor, data, 'utf8');
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Read content of file.
 * @param  {String} dir  Directory.
 * @param  {String} file File name.
 * @param {Boolean} logError
 * @return {Object}
 */
lib.read = async (dir, file, logError = true) => {
    // Construct file.
    file = `${lib.__baseDir}/${dir}/${file}.json`;

    try {
        // Read file content.
        const data = await readFile(file, 'utf8');

        // Returned 'JSON.parse'd object
        return objectify(data);
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Update operation.
 * @param  {String} dir  Directory
 * @param  {String} file File to update.
 * @param  {Object} data Data to update.
 * @param {Boolean} logError
 * @return {void}
 */
lib.update = async (dir, file, data, logError = true) => {
    // Construct file name.
    file = `${lib.__baseDir}/${dir}/${file}.json`;

    try {
        // Convert data object to string.
        data = typeof data === 'string' ? data : JSON.stringify(data);

        // Open file for reading.
        const fileDescriptor = await open(file, 'w+');

        // Truncate existing data.
        await truncate(fileDescriptor);

        // Write new data to file.
        await writeFile(fileDescriptor, data, 'utf8');
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Delete directory.
 * @param  {String} dir  Directory
 * @param  {String} file File to be deleted
 * @param {Boolean} logError
 * @return {Object}
 */
lib.delete = async (dir, file, logError = true) => {
    // Construct file name.
    file = `${lib.__baseDir}/${dir}/${file}.json`;

    try {
        // Unlink (delete) file.
        await unlink(file);
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Delete directory.
 * @param  {String} srcDir  Source directory
 * @param  {String} destDir  Destination directory
 * @param  {String} file    File to be deleted
 * @param {Boolean} logError
 * @return {Object}
 */
lib.copyFile = async (srcDir, destDir, file, options = {}, logError = true) => {
    // Construct file names.
    const src = `${lib.__baseDir}/${srcDir}/${file}.json`,
        dest = `${lib.__baseDir}/${destDir}/${file}.json`;

    try {
        debug(`Copying file from [${src}] to [${dest}]...`)
        // Copy file
        await copyFile(src, dest);


        if (options['-m']) {
            debug(`Moving file from [${src}] to [${dest}]...`)
            // Unlink (delete) file.
            await unlink(src);
        }
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description List directory files.
 * @param  {String} dir Directory.
 * @param {Boolean} logError
 * @return {Array}     Files
 */
lib.list = async (dir, logError = true) => {
    // Construct directory name.
    dir = `${lib.__baseDir}/${dir}/`;

    try {
        // Get directory files.
        const files = await readdir(dir);

        return (files || [])
            .filter(file => file.match(/\.json$/))
            .map(file => file.replace(/\.json$/, ''))
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Get the statistics about a file.
 * @param  {String}  dir      Directory name
 * @param  {String}  file     File name.
 * @param  {Boolean} logError If to logError
 * @return {Obect}           Statistics object.
 */
lib.stat = async (dir, file, logError = true) => {
    // Construct file name.
    file = `${lib.__baseDir}/${dir}/${file}.json`;

    try {
        // Stat.
        return await stat(file);
    } catch (e) {
        return lib.__debugAndLog(logError, e);
    }
};

/**
 * @description Debug and log error(s).
 * @param  {Error} e
 * @return {undefined}
 */
lib.__debugAndLog = (logError, e) => {
    if (logError) {
        // For console debugging
        debug(e);

        // Append log to log file.
        logger.append('errors', e);
    }

    // Return error to calling function.
    return e;
}

// Exporting module.
module.exports = lib;
