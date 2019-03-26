/**
 * Command line UI modifications module.
 */
// Dependencies.
const { inspect: inspectUtil } = require('util');

/**
 * @description Library container.
 * @type {Object}
 */
const lib = {};

/**
 * @description Meta elements UI.
 * @type {Object}
 */
lib._meta = {};

/**
 * @description Get the UI dimension at the time of input.
 * @return {Object}
 */
lib._meta.dimension = () => {
    const { columns, rows } = process.stdout;

    return { width: columns, height: rows };
};

/**
 * @description Print line in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib.line = message => process.stdout.write(`${message}\n`);

/**
 * @description Print dead error in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib.deadError = message => lib.line(`\x1b[41m${message}\x1b[49m`);


/**
 * @description Print error in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib.error = message => lib.line(`\x1b[31m${message}\x1b[39m`);


/**
 * @description Print success in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib.success = message => lib.line(`\x1b[32m${message}\x1b[39m`);

/**
 * @description Print warning in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib.warning = message => lib.line(`\x1b[33m${message}\x1b[39m`);

/**
 * @description Horizontal fill into space.
 * @param  {Numbet} count        Space to fill.
 * @param  {String} options.fill What to fill into space.
 * @param  {String} options.join What to use in stitching the array together.
 * @return {String}
 */
lib.horizontalFill = (count, { fill = ' ', join = '' } = {}) => {
    count = typeof count === 'number' && count > 0 && !(count % 1) && count;

    return count ? Array(count).fill(fill).join(join) : '';
};

/**
 * @description Center string(s) across the entire interface.
 * @param  {String} text
 * @param  {Number} {width} UI widtn.
 * @return {undefined}
 */
lib.centered = (text, { width } = lib._meta.dimension()) => {
    let textLen;

    if ((textLen = text.length) >= width) return text;

    const padding = Math.floor((width - textLen) / 2),
        pad = lib.horizontalFill(padding);

    return `${pad}${text}${pad}`
};

/**
 * @description List items.
 * @param   {String} title
 * @param   {Array}  items
 * @param   {undefined}
 */
lib.list = (title, items) => {
    const { width } = lib._meta.dimension();

    // Heading
    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);
    lib.line(`${lib.centered(title.toUpperCase())}`);
    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);

    // Traverse item of objects to build the
    for (let item in items) {
        item = items[item];
        let line = '';

        for (key in item) line += ` ${key}: \x1b[32m${item[key]}\x1b[39m`;

        lib.line(line.trim());
    }

    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);
};

/**
 * @description Make shift table for just 2 columns.
 * @param   {String} title
 * @param   {Object} object
 * @return  {undefined}
 */
lib.table = (title, object) => {
    const { width } = lib._meta.dimension(),
        qtr = Math.floor(width / 2.5);

    // Heading...
    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);
    lib.line(`${lib.centered(title.toUpperCase())}`);
    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);
    lib.line(`${lib.horizontalFill(width)}`);

    // Print table line by line
    for (let prop in object) {
        const key = prop, value = object[key];

        const left = qtr - key.length
            // Fit the key into the left side.
            leftString = `\x1b[33m ${left < 0 ? key : `${key}${lib.horizontalFill(left)}`} \x1b[0m`,
                // Construct right side.
                rightString = `: ${value}`;

        // Write out string.
        lib.line(`${leftString}${rightString}`);
        lib.line(`${lib.horizontalFill(width)}`);
    }

    // Close table.
    lib.line(`${lib.horizontalFill(width, { fill: '-' })}`);
};

lib.object = object => {
    const { width } = lib._meta.dimension();

    lib.line(`${lib.horizontalFill(width)}`);
    lib.line(inspectUtil(object, { colors: true }));
    lib.line(`${lib.horizontalFill(width)}`);
}

// Exporting module.
module.exports = lib;
