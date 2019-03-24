/**
 * Logger module.
 * This creates compressed files of logs an truncates the current.
 */
// Dependencies...
const logger = require('../logger');

/**
 * @description Main log rotation container.
 * @type {Object}
 */
let lib = {};

/**
 * @description Compress and truncate log for rotation.
 * @return {Function}
 */
lib.compressTruncate = async () => {
    // Get current time and date for comparison and file name creation
    let time = new Date();

    // Since logs are rotated on a daily basis, Files will only be compressed
    // and truncated around 12 pm.
    if (! (time.getHours() === 0 && time.getMinutes() === 0 && time.getSeconds() < 5))
        return;

    // Get use the previous day's date for compressed file name
    time.setDate(time.getDate() - 1);

    const year = time.getFullYear(),
        month = time.getMonth() + 1,
        stringMonth = String(month).length < 2 ? `0${month}` : month,
        date = time.getDate();

    // Create compressed file name and execute compression and truncate.
    const src = 'errors',
        dest = `errors-${year}-${stringMonth}-${date}`,
        operation = await logger.compress(src, dest);

    // In case of an error while compressing, log error to file.
    if (operation instanceof Error)
        logger.append('errors', operation);
};

module.exports = lib;
