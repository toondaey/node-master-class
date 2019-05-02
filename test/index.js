#!/usr/bin/env node

/**
 * Testing framework
 */
// Dependencies...
const { AssertionError } =  require('assert')
    , fs = require('fs');

const __ui = {
    descibeSpacing: '',
};

/**
 * @description Test results.
 * @type {Object}
 */
const __testResult = {
    successes: {
        count: 0
    },
    failures: {
        count: 0
    },
    testsCount: 0
};

/**
 * @description Encapsulating tests into blocks.
 * @param   {String} description   Test block description.
 * @param   {Function} testGroup
 */
global.describe = (description, testGroup) => {
    __ui.descibeSpacing += '  ';

    console.log(__ui.descibeSpacing + description);

    testGroup();

    __ui.descibeSpacing = __ui.descibeSpacing.replace(/\ \ $/, '');
};

/**
 * @description Test
 * @param   {String} description Test description.
 * @param   {Function} test      Test.
 */
global.it = (description, test) => {
    // Increment tests count when the function is called.
    ++__testResult.testsCount;

    (() => {
        try {
            // Try and run test, if done callback is called test passes.
            test(() => console.log(`${__ui.descibeSpacing}  \x1b[32m✔\x1b[39m ${description}`));

            // Increments test successes.
            ++__testResult.successes.count;
        } catch (error) {
            // Check that error is an assertion error or throw error
            if (error instanceof AssertionError) {

                // If error is assertion error increment failures count
                ++__testResult.failures.count;

                // Log message for user.
                console.log(`${__ui.descibeSpacing}  \x1b[31m✖\x1b[39m ${description}`);

                // Return so error is not thrown.
                return;
            }

            throw error;
        }
    })();
};

/**
 * @description Test result
 * @type {Function}
 */
const testResult = () => {
    console.log('');
    console.log('----------TEST SUMMARY----------');
    console.log('Total number of tests: ', __testResult.testsCount);
    console.log('Tests succeeded: ', __testResult.successes.count);
    console.log('');
    console.log('Tests failed: ', __testResult.failures.count);
    if (__testResult.failures.count) process.exit(1);
};


/**
 * Run tests when module is running in console.
 */
if (require.main === module) {
    // Fetch all all files.
    fs.readdir(__dirname, (err, files) => {
        // Validate for errors.
        if (err) return err;

        // Filter files so we only process files ending with .spec.js
        files = (files || []).filter(file => /\.spec\.js$/.test(file));

        // Check that spec files actually exists or exit otherwise.
        if (!files.length) {
            console.log('There seem to be no existing test files.');

            process.exit(1);
        }

        // Require all spec (a.k.a. test) files.
        for (let file in files) {
            file = require(`./${files[file]}`);
        }

        // Analyse test
        testResult();
    });
}
