/**
 * Sample functions to test.
 */
// Testing truthy
exports.truthy = (val, cb) => cb(3 - val);

// Deep strict equality
exports.deepEquality = () => ({ a: 1 });

// Does not throw.
exports.doesNotThrow = number => {
    if (!number) number = 1;

    if (isNaN(number)) throw new TypeError('type error.');

    return number *= 2;
};

// Strict Equal
exports.strictEqual = val => val * 2;
