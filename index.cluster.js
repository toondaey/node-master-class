const http = require('http'),
    url = require('url')
port = 3000,
    { StringDecoder } = require('string_decoder'),
    cluster = require('cluster'),
    { cpus } = require('os'),
    { debuglog } = require('util'),
    debug = debuglog('server'),
    config = require('./config');

var server = http.createServer((req, res) => {
    // Url parsing
    const parsedUrl = url.parse(req.url, true);
    // Get path
    const path = parsedUrl.pathname;
    // Get trimmed url
    const trimmedUrl = path.replace(/^\/+|\/+$/g, '');
    // Get method
    const method = req.method;
    // Get data
    let buffer = '';
    const decoder = new StringDecoder('utf-8');

    // Process data in buffers.
    req.on('data', data => buffer += decoder.write(data));

    req.on('end', () => {
        buffer += decoder.end();

        // Get available handlers.
        const end = endpoints[trimmedUrl];
        const handler = typeof end !== 'undefined' ? end : handlers.notFound;

        handler(buffer, (status, data) => {
            status = typeof status === 'number' ? status : 404;

            data = typeof data === 'object' ? data : {};

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(status);
            res.end(JSON.stringify(data));
        });
    });
    // Get query string
    console.log(`[${method.toUpperCase()}] ${config.port}: ${trimmedUrl}`);
});

// Running in cluster mode a.k.a swarm mode.
if (cluster.isMaster) {
    // Nothing to do in the cluster master for now but log a debug
    // message for the world to be at ease.
    debug('This is the \x1b[32mmaster\x1b[39m...');

    // Fork cluster to proceed.
    for (let _ = 0; _ < cpus().length; _++) { cluster.fork(); }
} else {
    // Start server process on forked processes.
    server.listen(config.port, () => console.log(`\x1b[32mListening on ${config.port}...\x1b[39m`));
}

// Handlers
const handlers = {
    notFound(data, cb) {
        cb(404, { message: 'Page not found.' })
    }
};

handlers.hello = (data, cb) => {
    cb(200, { message: 'Hello Node!' });
};

// Available endpoints
const endpoints = {
    hello: handlers.hello,
};