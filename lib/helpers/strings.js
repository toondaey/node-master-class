/**
 * Helpers for all string modifications.
 */
// Dependencies

/**
 * @description String helpers.
 * @type {Object}
 */
let lib = {};

/**
 * @description Convert JSON string to object or return empty object on error.
 * @param  {string} data
 * @return {Object}
 */
lib.objectify = data => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return false;
    }
};

/**
 * @description JSON serialize objects
 * @param  {Object} data
 * @return {String}
 */
lib.stringify = data => {
    try {
        return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (e) {
        return false;
    }
};

lib.randomString = (strLen = 10) => {
    // Validate that length is number.
    if (typeof strLen !== 'number') return false;

    // Construct characters.
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    chars += chars.toUpperCase();
    chars += '0123456789';
    let rand = '';

    // Create random strings
    try {
        while (rand.length < strLen) rand += chars[Math.floor(Math.random() * chars.length)];
    } catch (e) {
        rand = false;
    }

    // Return strings.
    return rand;
}

/**
 * @description Query string maker.
 * @param       {Object}    data     Data to convert to query
 * @param       {String}    sep      Item separator in query.
 * @param       {String}    eq       Item assignor in query.
 * @param       {String}    _initKey Initial key.
 * @param       {Object}    _keys    Dictionary of keys assignable to items.
 * @param       {Boolean}   _start   This tell the function when to trim and return query.
 */
lib.toQueryString = (data, sep = '&', eq = '=', _initKey = '', _key = '', _keys = {}, _start = false) => {
    // Invert start so query function doesn't remove separator after building query per item.
    _start = !_start;

    // Query placeholder for each item (query) built.
    let _query = '';

    // Check that no unusual object attribute is included in the build
    if (
        typeof data === 'function' ||
        typeof data === 'symbol' ||
        typeof data === 'undefined' ||
        data === null
    ) return '';

    // Build the item's key based on the type of item it is.
    if (_initKey && _key === '[]') {
        _initKey += `${_key}`;
    } else if (_initKey && _key) {
        _initKey += `[${_key}]`;
    }

    // Return item if it's type is a primitive object.
    if (typeof data !== 'object') return `${_initKey}${eq}${encodeURIComponent(data)}`;

    // Get object keys for looping and building query.
    // This is the main meat of the function.
    const keys = Object.keys(data);

    // Looping through keys...
    keys.forEach(item => {
        // Save the key of each item regardless of type of data.
        // This will be used to determine the key to use for each item.
        _keys[item] = _initKey;

        // Determine the key to add to the next value
        const key = !Array.isArray(data) ? (_initKey ? item : '') : (!_initKey ? _key : '[]');

        // Check if initKey is present or make a new one.
        // This is used to form a new key when recursion is back at root of the object.
        _initKey = !_initKey ? `&${item}` : _initKey;

        // Recursively build the query and concatenate to current persisting query.
        _query += lib.toQueryString(data[item], sep, eq, _initKey, key, _keys, true);

        // Set the key according to the dictionary build above.
        _initKey = _keys[item];
    });

    // Return final query if recursion is back to the beginning
    if (_start) {
        // Create regular expression to remove any separator at beginning or end.
        const pattern = new RegExp(`^\\${sep}+|\\${sep}+$`, 'g');

        // Return final query.
        return _query.replace(pattern, '');
    }

    // Return query for each item.
    return _query;
};

// Exporting...
module.exports = lib;
