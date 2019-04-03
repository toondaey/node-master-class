/**
 * This is the main entry file into the entire application.
 */
// Get base directory.
global.__baseDir = __dirname;

// Dependencies
const server = require('./lib/server'),
    worker = require('./lib/workers'),
    cli = require('./lib/cli');

/**
 * @description App module.
 */
let app = {};

/**
 * @description  App initializer.
 * @todo Initiate log rotation function on a daily basis
 */
app.init = () => {
    // Start up the server.
    server.init();
    // Start up all worker.
    worker.init();

    // Start cli.
    setTimeout(() => {
        cli.init();
    }, 50);
};

/**
 * Initialize application.
 */
app.init();

/**
 * @description Export module.
 */
module.exports = app;
