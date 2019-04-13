/**
 * All CLI-related processes.
 */
// Dependencies
// Independent of __baseDir.
const readline = require('readline')
    ,Event = require('events')
    , path = require('path')
    , __ui = require('./_ui')

// Check entry point.
global.__cliEntry = require.main === module;

// Set base directory of the app of entry is
// directly from cli and not prompt.
if (__cliEntry) global.__baseDir = path.join(__dirname, '../../');

// Dependencies with references to __baseDir.
const __input = require('./_input')
    , { commands } = require('./_handlers');

// Make event
class _events extends Event {}
const _e = new _events();

/**
 * @description Library container
 * @type {Object}
 */
const lib = {};

/**
 * @description Initialize module.
 * @return {undefined}
 */
lib.init = () => {
    // Create interface.
    const _interface = lib._interface(),
    // Get the available prompts.
        _prompts = Object.keys(commands);

    // Start up the prompt interface.
    _interface.prompt();

    // Bind all available prompts to their respective listeners
    lib._bindEvents(_prompts);

    // Listen for events from the prompt
    _interface.on('line', input => {
        // Parse the input for the prompt and corresponding parameters.
        const { prompt, parameters } = __input.parse(_prompts, input);

        // Check that user actually supplied prompt an parameters.
        // Emit event if so.
        if (prompt && parameters) _e.emit(prompt, _prompts, parameters, _interface);

        // If no prompt was provided, return an error
        else if (!input) __ui.deadError('No command provided.');

        // Also  return error if prompt wasn't recognized.
        else __ui.deadError(`[${input}] command does not exist.`);

        // Reinitiate the prompt for input.
        if (!prompt || prompt.toLowerCase() !== 'exit') setTimeout(() => _interface.prompt(), 50);
    });
};

/**
 * @description Bind all prompts to their corresponding listeners.
 * @param  {Array} prompts
 * @return {undefined}
 */
lib._bindEvents = prompts => {
    prompts.forEach(prompt => {
        try {
            _e.on(prompt, commands[prompt].handler);
        } catch (e) {
            __ui.deadError('Something went wrong');
        }
    });
};

/**
 * Create the read line interface
 * @return {Object}
 */
lib._interface = () => {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
};

// Export if file is required by another node module
if (__cliEntry) {
    // Get the command
    let input = process.argv.slice(2);

    // Check the prompt.
    prompt = input.shift();

    // Get prompt handler.
    prompt = commands[prompt];

    // Check that prompt handler exists.
    if (!prompt) {
        __ui.error('Command does not exist.');

        process.exit(1)
    }

    // Process command
    prompt.handler(Object.keys(commands), input);
} else {
    // Exporting library.
    module.exports = lib;
}
