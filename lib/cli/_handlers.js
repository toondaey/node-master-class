/**
 * Prompts handlers
 */
// Dependencies
const __data = require('../data'),
    __ui = require('./_ui');

/**
 * @description Event listener handlers container.
 * @type {Object}
 */
const lib = {};

/**
 * @description Menu listener
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib.menu = async () => {
    // Get all menu
    const menu = await __data.read('menu', 'default');

    // Placeholder
    let list = [];

    for (let item in  menu) {
        item = menu[item];

        list.push({ Name: item.name, Price: item.price });
    }

    // Print list if there are menu items.
    if (list.length) __ui.list('menu', list);
    // Print error message if no menu item found.
    else __ui.error('No menu item found.');
};

/**
 * @description Get an individual user details.
 * @param {String} id User email parameter
 * @return {undefined}
 */
lib.user = async email => {
    // Get the email by parsing the flag and removing all unwanted options.
    email = email.replace(/^--email='?|'/g, '');

    // Get the user while extracting data.
    const { firstName, lastName, email: emailAddress, address } = await __data.read('users', email, false);

    // Check that a user is returned and not the instance of an error.
    if (!(firstName && lastName && emailAddress && address)) return __ui.error('User does not exist.');

    // Print user
    __ui.object({
        name: `${firstName} ${lastName}`,
        email: emailAddress,
        address,
    });
};

/**
 * @description
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib.users = async (_prompts, parameters) => {
    // Placeholder...
    let email;

    // Check that user only requested for details of a particular registered user.
    if ((email = parameters.findIndex(param => /^--email=.+$/.test(param))) !== -1)
        return lib.user(parameters[email]);

    // Get all users.
    const users = await __data.list('users'),
        // Check if the user wants the latest users.
        latest = parameters.indexOf('--latest') !== -1;

    // Placeholder
    let list = [];

    for (let user in users) {
        user = users[user];

        // For latest registered users...
        if (latest) {
            // Get the user's file stat.
            const stat = await __data.stat('users', user);

            // Check when the file was created which represents
            // when the user registered.
            if (stat.birthtime < new Date() - (1000 * 60 * 60 * 24)) continue;
        }

        // Get the user details.
        user = await __data.read('users', user);

        // Push user info to list.
        list.push({ Name: `${user.firstName} ${user.lastName}`, Email: `${user.email}` });
    }

    // List users if users exist.
    if (list.length) __ui.list('users', list);
    // Print out message if no use exists.
    else __ui.error('No user matches that criteria.');
};

/**
 * @description Get an individual order details.
 * @param {String} id Order id parameter
 * @param {Array}  dirs Available directories.
 * @return {undefined}
 */
lib.order = async (id, dirs) => {
    // Extract ID from the parameter.
    id = id.replace(/^--id='?|'/g, '');

    // Contents placeholder.
    let content = [];

    // Traverse the directories to get all the orders.
    for (let dir in dirs) {
        // Get all orders for each directory.
        const files = await __data.list(dirs[dir], false);

        for (let file in files) files.splice(file, 1, { name: files[file], dir: dirs[dir] });

        // Add retrieved files to the content placeholder.
        content = content.concat(Array.isArray(files) ? files : [])
    }

    // Fetch the order file name (if existing) from all retrieved orders.
    const filename = content.find(order => order.name === id);

    // Check that order exists and return error if non-existent.
    if (!filename) __ui.error(`Order with id [${id}] does not exist.`);

    // Replace the order
    const order = await __data.read(filename.dir, filename.name, false);

    // Print out order
    __ui.object(order);
};

/**
 * @description Orders listeners
 * @param  {Array} options._prompts
 * @param  {Array} options.parameters
 * @return {undefined}
 */
lib.orders = async (_prompts, parameters) => {
    // List all possible directories for all orders.
    const dirs = ['orders/pending', 'orders/fulfilled', 'orders/processing'];

    // Placeholder...
    let id;

    // Check that user only requested for details of a particular registered user.
    if ((id = parameters.findIndex(param => /^--id=.+$/.test(param))) !== -1)
        return lib.order(parameters[id], dirs);

    // Check to see if the latest flag was appended.
    const latest = parameters.indexOf('--latest') !== -1;

    // Place holder.
    let list = [];

    // Traverse all orders directory to get all orders.
    for (let dir in dirs) {
        dir = dirs[dir];

        // Get order for present directory.
        let orders = await __data.list(dir);

        // Check that directory is not empty.
        if (orders instanceof Error || !(orders || []).length) continue;

        for (let order in orders) {
            order = orders[order];

            // If user only requests the latest order(s),
            // give latest order(s).
            if (latest) {
                // Get the stat for each order file.
                const stat = await __data.stat(dir, order);

                // Check the time of file creation which will represent
                // the time the order was placed.
                if (stat.birthtime < Date.now() - (1000 * 60 * 60 * 24)) continue;
            }

            // Push to list...
            list.push({ 'Order ID': order, State: dir.replace('orders/', '')})
        }
    }

    // List orders if any exists matching criteria.
    if (list.length) __ui.list('orders', list);
    // Print out message if list is empty.
    else __ui.error('Sorry, no order matches that criteria.')
};

/**
 * @description Help listener.
 * @param  {Array} options._prompts
 * @return {undefined}
 */
lib.help = _prompts => {
    const object = {};

    for (prompt in _prompts) {
        const key = commands[_prompts[prompt]].help.key,
            value = commands[_prompts[prompt]].help.message;

        object[key] = value;
    }

    __ui.table('cli manual', object);
};

/**
 * @description Exit the input interface.
 * @param {Array}
 * @param {Object}
 * @param {Object}
 * @return {undefined.}
 */
lib.exit = (_prompts, parameters, _interface) => {
    // Print information to user.
    __ui.success('Prompt closed.');

    // Closing prompt interface.
    _interface.close();
};

/**
 * @description Available prompts.
 * @type {Object}
 */
let commands = {
    help: {
        handler: lib.help,
        help: {
            key: 'help',
            message: 'Show this help.'
        },
    },
    menu: {
        handler: lib.menu,
        help: {
            key: 'menu',
            message: 'Show all menu items.',
        },
    },
    orders: {
        handler: lib.orders,
        help: {
            key: 'orders [--id=ID] [--latest]',
            message: `Show orders. Use \x1b[1m--latest\x1b[0m flag to get the orders made in the last 24 hours and \x1b[1m--id\x1b[0m to view details of an order.`,
        },
    },
    users: {
        handler: lib.users,
        help: {
            key: 'users [--email=EMAIL] [--latest]',
            message: 'Show users. Use \x1b[1m--latest\x1b[0m flag to view users created in the last 24 hours and \x1b[1m--email\x1b[0m to view a user\'s details.',
        },
    },
};

if (!__cliEntry) {
    commands = Object.assign({
        exit: {
            handler: lib.exit,
            help: {
                key: 'exit',
                message: 'Exit the prompts but leave the application running.'
            }
        }
    }, commands);
}

// Export module
module.exports = {
    commands,
    __handlers: lib
};
