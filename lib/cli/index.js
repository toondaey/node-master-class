/**
 * All CLI-related processes.
 */
// Dependencies
const readline = require('readline'),
    Event = require('events');

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

lib._handlers.menu = parameters => {
    console.log(parameters);
};

lib._handlers.users = parameters => {
    console.log(parameters);
};

lib._handlers.orders = parameters => {
    console.log(parameters);
};

/**
 * @description UI formating.
 * @type {Object}
 */
lib._ui = {};

lib._ui.error = message => {
    process.stdout.write(`\x1b[41m${message}\x1b[0m\n`);
};

/**
 * @description Input parser
 * @type {Object}
 */
lib._input = {};

lib._input.parse = (prompts, input) => {
    input = input.split(' ');

    const prompt = lib._input.validate(prompts, input.shift());

    return prompt && {
        prompt,
        parameters: input
    };
};

lib._input.validate = (prompts, cmd) => {
    return prompts.indexOf(cmd) !== -1 && cmd;
};

// class Cli {
//     constructor() {
//         //
//     }

//     static get _interface() {
//         console.log(this.getOwnPropertyNames());
//         return;
//     }

//     static init() {
//         const _interface = Cli._interface;

        // _interface.prompt();

        // _interface.on('line', input => {
        //     console.log(input);

        //     _interface.prompt();
        // });
//     }

//     _() {
//         return readline.createInterface({
//             input: process.stdin,
//             output: process.stdout,
//         });
//     }
// }

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
            key: 'orders [--latest [--pending] [--processing] [--fulfilled]]',
            message: `
                Show orders. Providing only the \x1b[1m--latest\x1b[0m flag will default to the latest (i.e in the last 24 hours) pending orders.
                Depending on the flag(s):
                    - (latest) pending orders,
                    - (latest) orders being processed, or
                    - (latest) fulfilled orders.
            `,
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
        handler: lib.handlers.help,
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
        const command = lib._input.parse(_prompts, input);

        if (command) {
            _e.emit(command.prompt, command.parameters);
        } else {
            lib._ui.error(`[${input}] command does not exist.`);
        }

        _interface.prompt();
    });
};

lib._bindEvents = prompts => {
    prompts.forEach(prompt => {
        _e.on(prompt, lib._prompts[prompt].handler);
    });
};

lib._interface = () => {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
};

// Export if file is required by another node module
if (require.main === module) {
    // Run script directly if run from terminal
    lib.init()
} else {
    // Exporting library.
    module.exports = Cli;
}