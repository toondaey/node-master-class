/**
 * All CLI-related processes.
 */
// Dependencies
const readline = require('readline');

/**
 * @description Library container
 * @type {Object}
 */
const lib = {};

// Module initializer.
lib.init = () => {
    const interface = lib._interface();

    interface.prompt();

    interface.on('line', input => {
        console.log(input);

        interface.prompt();
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
    module.exports = lib;
}