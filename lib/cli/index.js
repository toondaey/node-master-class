/**
 * All CLI-related processes.
 */
// Dependencies
const readline = require('readline'),
    Event = require('events'),
    __ui = require('./_ui'),
    commands = require('./_handlers');

class _events extends Event {}
const _e = new _events();

/**
 * @description Library container
 * @type {Object}
 */
const lib = {};

/**
 * @description Input parser
 * @type {Object}
 */
lib._input = {};

/**
 * Parse the user's input to split the command.
 * @param  {Array} prompts
 * @param  {String} input
 * @return {Object}         Prompts and parameters.
 */
lib._input.parse = (prompts, input) => {
    input = input.trim().split(' ');

    let prompt;

    return prompts.indexOf(prompt = input.shift()) !== -1 && { prompt, parameters: input };
};

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
        const { prompt, parameters } = lib._input.parse(_prompts, input);

        // Check that user actually supplied prompt an parameters.
        // Emit event if so.
        if (prompt && parameters)  _e.emit(prompt, _prompts, parameters, _interface);

        // If no prompt was provided, return an error
        else if (!input) __ui.deadError('No command provided.');

        // Also  return error if prompt wasn't recognized.
        else __ui.deadError(`[${input}] command does not exist.`);

        // Reinitiate the prompt for input.
        setTimeout(() => { _interface.prompt(); }, 50);
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
// if (require.main === module) {
//     // Run script directly if run from terminal
//     lib.init()
// } else {
    // Exporting library.
    module.exports = lib;
// }
