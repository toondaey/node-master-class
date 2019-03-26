/**
 * Input parser.
 */
// Dependencies...

/**
 * @description Main container.
 * @type {Object}
 */
const lib = {};

/**
 * Parse the user's input to split the command.
 * @param  {Array} prompts
 * @param  {String} input
 * @return {Object}         Prompts and parameters.
 */
lib.parse = (prompts, input) => {
    input = input.trim().split(' ');

    let prompt;

    return prompts.indexOf(prompt = input.shift()) !== -1 && { prompt, parameters: input };
};

// Exporting module...
module.exports = lib;
