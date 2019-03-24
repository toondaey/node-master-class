const http = require('http'),
    url = require('url')
    port = 3000,
    {StringDecoder} = require('string_decoder'),
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

server.listen(config.port, () => console.log(`Listening on ${config.port}`));

// Handlers
const handlers = {
    notFound(data, cb) {
        cb(404, {message: 'Page not found.'})
    }
};

handlers.hello = (data, cb) => {
    cb(200, {message: 'Hello Node!'});
};

// Available endpoints
const endpoints = {
    hello: handlers.hello,
};