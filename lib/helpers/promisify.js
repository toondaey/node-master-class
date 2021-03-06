/**
 * Convert to promises.
 */
// Dependencies
const fs = require('fs'),
    zlib = require('zlib'),
    https = require('https'),
    { token: {create: createToken}, charge: {create: createCharge} } = require('./payment'),
    { mail: sendMail } = require('./mail'),
    { getTemplate, mergeAllTemplates, getStaticAsset } = require('./templates'),
    { promisify } = require('util');

/**
 * Main container.
 * @type {Object}
 */
let lib = {};

// Promisify callback methods.
lib.open = promisify(fs.open);
lib.writeFile = promisify(fs.writeFile);
lib.copyFile = promisify(fs.copyFile);
lib.readFile = promisify(fs.readFile);
lib.appendFile = promisify(fs.appendFile);
lib.truncate = promisify(fs.ftruncate);
lib.unlink = promisify(fs.unlink);
lib.readdir = promisify(fs.readdir);
lib.stat = promisify(fs.stat);
lib.gzip = promisify(zlib.gzip);
lib.unzip = promisify(zlib.unzip);
lib.createPaymentToken = promisify(createToken);
lib.createPaymentCharge = promisify(createCharge);
lib.sendMail = promisify(sendMail);
lib.getTemplate = promisify(getTemplate);
lib.mergeAllTemplates = promisify(mergeAllTemplates);
lib.getStaticAsset = promisify(getStaticAsset);

// Export module.
module.exports = lib;
