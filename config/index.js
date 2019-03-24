/**
 * Configuration options for the server.
 */
// Dependencies

// Determine environment.
let currEnv = process.env.NODE_ENV, config;
currEnv = (typeof currEnv === 'string' && currEnv || 'config').toLowerCase();

try {
    /**
     * @description Get configuration based on environment
     * @type {Object}
     */
    config = require(`./${currEnv}`);
} catch (e) {
    /**
     * @default config
     */
    config = require('./config');
}

// Global configs.
config = Object.assign(config, require('./app'));

// Export module;
module.exports = config;
