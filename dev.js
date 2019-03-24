/**
 * This file is mean to trigger a restart of the node process when there are changes to specific files.
 * This is only meant to be used for developmental purposes.
 */
// Dependencies...
const fs = require('fs'),
    { spawn } = require('child_process');

let node = spawn('node', ['index.js']);

node.stdout.on('data', (data) => {
    console.log(`${data}`);
});

fs.watch('./lib/', {encoding: 'buffer', recursive: true}, (event, filename) => {
    console.log(`${filename}`);
});
