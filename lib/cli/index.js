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

lib._handlers.menu = async ({_prompts, parameters}) => {
    const menu = await __data.read('menu', 'default'),
        {width} = lib._ui.dimension();

    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('Menu')}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
    menu.forEach(item => {
        // Write out string.
        process.stdout.write(`Name: \x1b[32m${item.name}\x1b[39m Price: \x1b[33m$${item.price}\x1b[39m`);
        process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
    });
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
};

lib._handlers.users = ({_prompts, parameters}) => {
    console.log(parameters);
};

lib._handlers.orders = ({_prompts, parameters}) => {
    console.log(parameters);
};

lib._handlers.help = ({_prompts}) => {
    const {width} = lib._ui.dimension(),
        qtr = Math.floor(width / 2.5);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.centered('CLI MANUAL')}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
    process.stdout.write(`${lib._ui.horizontalFill(width)}\n`);
    _prompts.forEach(prompt => {
        lib._ui.horizontalFill();
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
    process.stdout.write(`${lib._ui.horizontalFill(width, {fill: '-'})}\n`);
};

/**
 * @description UI formating.
 * @type {Object}
 */
lib._ui = {};

lib._ui.dimension = () => {
    const { columns, rows } = process.stdout;

    return {width: columns, height: rows};
};

lib._ui.error = message => {
    process.stdout.write(`\x1b[41m${message}\x1b[0m\n`);
};

lib._ui.horizontalFill = (count, {fill = ' ', join = ''} = {}) => {
    count = typeof count === 'number' && count > 0 && !(count % 1) && count;

    return count ? Array(count).fill(fill).join(join) : '';
};

lib._ui.centered = (text, {width} = lib._ui.dimension()) => {
    let textLen;

    if ((textLen = text.length) >= width) return text;

    const padding = Math.floor((width - textLen) / 2),
        pad = lib._ui.horizontalFill(padding);

    return `${pad}${text}${pad}`
}

// (['header1', 'header2'], [['content1a', 'content1a'], ['content1b', 'content1b']])
lib._ui.table = (head, rows, {bordered = false} = {}) => {
    const columns = head.length,
        { width } = lib._ui.dimension();

    let columnsLength = Array(columns).fill(0),
        constructedRows = [];

    rows.forEach(row => {
        newRow = [];

        for (let i = 0; i < columns; i++) {
            const text = row[i].split(os.EOL || '\n');

            newRow.push(text);

            columnsLength[i] = text.reduce((t, v) => {
                const vLen = v.length

                if (vLen > t) t = vLen;

                return t;
            }, columnsLength[i]);
        }

        constructedRows.push(newRow);
    });
};

/**
 * @description Input parser
 * @type {Object}
 */
lib._input = {};

lib._input.parse = (prompts, input) => {
    input = input.split(' ');

    const prompt = lib._input.validate(prompts, input.shift());

    return prompt && { prompt, parameters: input };
};

lib._input.validate = (prompts, cmd) => {
    return prompts.indexOf(cmd) !== -1 && cmd;
};

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
            message: `Show orders.use \x1b[1m--latest\x1b[0m flag to get the orders within 24 hours.`,
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

// Module initializer.
lib.init = () => {
    const _interface = lib._interface(),
        _prompts = Object.keys(lib._prompts);

    _interface.prompt();

    lib._bindEvents(_prompts);

    _interface.on('line', input => {
        const { prompt, parameters } = lib._input.parse(_prompts, input);

        if (prompt && parameters) {
            _e.emit(prompt, {_prompts, parameters});
        } else {
            lib._ui.error(`[${input}] command does not exist.`);
        }

        setTimeout(() => { _interface.prompt(); }, 50);
    });
};

lib._bindEvents = prompts => {
    prompts.forEach(prompt => {
        try {
            _e.on(prompt, lib._prompts[prompt].handler);
        } catch (e) {
            console.error('Something went wrong');
        }
    });
};

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
