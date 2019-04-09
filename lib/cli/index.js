/**
 * All CLI-related processes.
 */
// Dependencies
const readline = require('readline'),
    Event = require('events'),
    __data = require('../data'),
    { inspect } = require('util'),
    os = require('os');

class _events extends Event {}
const _e = new _events();

/**
 * @description Library container
 * @type {Object}
 */
const lib = {};

/**
 * @description Event listener handlers container.
 * @type {Object}
 */
lib._handlers = {};

/**
 * @description Menu listener
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib._handlers.menu = async ({_prompts, parameters}) => {
    // Get all menu
    const menu = await __data.read('menu', 'default'),
    // UI dimension for UI modification
        {width} = lib._ui.dimension();

    // UI modifications.
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('Menu')}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);

    // Traverse the menu for printing each item.
    menu.forEach(item => {
        // Write out string.
        process.stdout.write(`Name: \x1b[32m${item.name}\x1b[39m Price: \x1b[33m$${item.price}\x1b[39m`);
        process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
    });
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
};

/**
 * @description
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib._handlers.users = async ({_prompts, parameters}) => {
    // Get all users.
    const users = await __data.list('users'),
    // Check if the user wants the latest users.
        latest = parameters.indexOf('--latest') !== -1;

    // UI modification...
    const { width } = lib._ui.dimension();
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('Users'.toUpperCase())}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);

    // Traverse all users for printing
    users.forEach(async (user, index) => {
        // For latest registered users...
        if (latest) {
            // Get the user's file stat.
            const stat = await __data.stat('users', user);

            // Check when the file was created which represents
            // when the user registered.
            if (stat.birthtime < new Date() - (1000 * 60 * 60 * 24)) return;
        }

        // Get the user details.
        user = await __data.read('users', user);

        // Print out users details
        process.stdout.write(
            // Create text manipulation UI method.
            `Email: \x1b[32m${user.email}\x1b[39m Name: \x1b[32m${user.firstName} ${user.lastName}\x1b[39m\n`
        );

        // UI modification...
        process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
        if (users.length - 1 === index)
            process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    });
};

/**
 * @description Orders listeners
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib._handlers.orders = ({_prompts, parameters}) => {
    // List all possible directories for all orders.
    const dirs = ['orders/pending', 'orders/fulfilled', 'orders/processing']
    // Check to see if the latest flag was appended.
        latest = parameters.indexOf('--latest') !== -1;

    // UI modification...
    const { width } = lib._ui.dimension();
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('orders'.toUpperCase())}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);

    // Traverse all orders directory to get all orders.
    dirs.forEach(async (directory, index) => {
        // Get order for present directory.
        let orders = await __data.list(directory);

        // Check that directory is not empty.
        if (orders instanceof Error || !(orders || []).length) return;

        // Traverse all orders per directory for writing out.
        orders.forEach(async order => {
            // If user only requests the latest order(s),
            // give latest order(s).
            if (latest) {
                // Get the stat for each order file.
                const stat = await __data.stat(directory, order);

                // Check the time of file creation which will represent
                // the time the order was placed.
                if (stat.birthtime < Date.now() - (1000 * 60 * 60 * 24)) return;
            }

            // Write out order.
            process.stdout.write(`Order ID: \x1b[32m${order}\x1b[39m State: \x1b[32m${directory.replace('orders/', '')}\x1b[39m\n`)

            // UI modification...
            process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
        });

        if (dirs.length - 1 === index)
            process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    });
};

/**
 * @description Help listener.
 * @param  {Array} options._prompts
 * @return {undefined}
 */
lib._handlers.help = ({_prompts}) => {
    const {width} = lib._ui.dimension(),
        qtr = Math.floor(width / 2.5);

    // UI modification...
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('CLI MANUAL')}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);

    // Traverse prompts to the their respective help messages.
    _prompts.forEach(prompt => {
        // Get prompts.
        prompt = lib._prompts[prompt];

        // Get the key
        const key = prompt.help.key, value = prompt.help.message;

        // Get the remainder from the total allocated to the left side.
        const left = qtr - key.length,
        // Fit the key into the left side.
            leftString = `\x1b[33m ${left < 0 ? key : `${key}${lib._ui.horizontalFill(left)}`} \x1b[0m`,
        // Construct right side.
            rightString = `: ${value}`;

        // Write out string.
        process.stdout.write(`${leftString}${rightString}\n`);
        process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
    });
    // UI modification
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
};

/**
 * @description UI formating.
 * @type {Object}
 */
lib._ui = {};

/**
 * @description Get the UI dimension at the time of input.
 * @return {Object}
 */
lib._ui.dimension = () => {
    const { columns, rows } = process.stdout;

    return {width: columns, height: rows};
};

/**
 * @description Print error in terminal
 * @param  {String} message
 * @return {undefined}
 */
lib._ui.error = message => process.stdout.write(`\x1b[41m${message}\x1b[0m\n`);

/**
 * @description Horizontal fill into space.
 * @param  {Numbet} count        Space to fill.
 * @param  {String} options.fill What to fill into space.
 * @param  {String} options.join What to use in stitching the array together.
 * @return {String}
 */
lib._ui.horizontalFill = (count, {fill = ' ', join = ''} = {}) => {
    count = typeof count === 'number' && count > 0 && !(count % 1) && count;

    return count ? Array(count).fill(fill).join(join) : '';
};

/**
 * @description Center string(s) across the entire interface.
 * @param  {String} text
 * @param  {Number} {width} UI widtn.
 * @return {undefined}
 */
lib._ui.centered = (text, {width} = lib._ui.dimension()) => {
    let textLen;

    if ((textLen = text.length) >= width) return text;

    const padding = Math.floor((width - textLen) / 2),
        pad = lib._ui.horizontalFill(padding);

    return `${pad}${text}${pad}`
}

/**
 * @description Input parser
 * @type {Object}
 */
lib._input = {};

/**
 * Parse the user's input to split the command.
 * @param  {Array} prompts
 * @param  {String} input
 * @return {Object}         Prompts and parameters.
 */
lib._input.parse = (prompts, input) => {
    input = input.split(' ');

    let prompt;

    return prompts.indexOf(prompt = input.shift()) !== -1 && { prompt, parameters: input };
};

/**
 * @description Available prompts.
 * @type {Object}
 */
lib._prompts = {
    menu: {
        handler: lib._handlers.menu,
        help: {
            key: 'menu',
            message: 'Show all menu items.',
        },
    },
    orders: {
        handler: lib._handlers.orders,
        help: {
            key: 'orders [--latest]',
            message: `Show orders. Use \x1b[1m--latest\x1b[0m flag to get the orders made in the last 24 hours.`,
        },
    },
    users: {
        handler: lib._handlers.users,
        help: {
            key: 'users [--latest]',
            message: 'Show users. Use \x1b[1m--latest\x1b[0m flag to view users created in the last 24 hours.',
        },
    },
    help: {
        handler: lib._handlers.help,
        help: {
            key: 'help',
            message: 'Show this help.'
        },
    }
};

/**
 * @description Initialize module.
 * @return {undefined}
 */
lib.init = () => {
    // Create interface.
    const _interface = lib._interface(),
    // Get the available prompts.
        _prompts = Object.keys(lib._prompts);

    // Start up the prompt interface.
    _interface.prompt();

    // Bind all available prompts to their respective listeners
    lib._bindEvents(_prompts);

    // Listen for events from the prompt
    _interface.on('line', input => {
        // Parse the input for the prompt and corresponding parameters.
        const { prompt, parameters } = lib._input.parse(_prompts, input);

        // Check that user actually supplied prompt an parameters.
        // Emit event if so.
        if (prompt && parameters)  _e.emit(prompt, {_prompts, parameters});

        // If no prompt was provided, return an error
        else if (!prompt && !parameters) lib._ui.error('No command provided.');

        // Also  return error if prompt wasn't recognized.
        else lib._ui.error(`[${input}] command does not exist.`);

        // Reinitiate the prompt for input.
        setTimeout(() => { _interface.prompt(); }, 50);
    });
};

/**
 * @description Bind all prompts to their corresponding listeners.
 * @param  {Array} prompts
 * @return {undefined}
 */
lib._bindEvents = prompts => {
    prompts.forEach(prompt => {
        try {
            _e.on(prompt, lib._prompts[prompt].handler);
        } catch (e) {
            console.error('Something went wrong');
        }
    });
};

/**
 * Create the read line interface
 * @return {Object}
 */
lib._interface = () => {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
};

// Export if file is required by another node module
// if (require.main === module) {
//     // lib._ui.table();
//     // Run script directly if run from terminal
//     lib.init()
// } else {
    // Exporting library.
    module.exports = lib;
// }
