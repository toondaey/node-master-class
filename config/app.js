// Globals data.
// Dependencies
const config = require('./config');

module.exports = {
    globals: {
        app: 'Pizzaria',
        url: `localhost:${config.httpPort}`,
        yearCreated: '2019'
    }
};
