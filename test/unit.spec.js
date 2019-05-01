/**
 * Test demo
 */

const assert = require('assert')
    , { truthy, deepEquality, strictEqual, doesNotThrow } = require('../app/lib');

describe('unit test', () => {
    it('should be truthy', done => {
        truthy(2, sub => {
            assert(sub);
        });

        done();
    });

    it('should be deeply equal', done => {
        assert.deepStrictEqual(deepEquality(), { a: 1 });

        done();
    });

    it('should strict equal 4 when pass', done => {
        assert.strictEqual(strictEqual(2), 4);

        done();
    });

    it('should not throw', done => {
        assert.doesNotThrow(doesNotThrow, SyntaxError);

        done();
    });
});
