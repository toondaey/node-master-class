// const https = require('https'),
//     { promisify } = require('util'),
//     qs = require('querystring');

// const request = (path, cb) => {
//     const ctx = {
//         hostname: 'challenges.hackajob.co',
//         path,
//         agent: new https.Agent({ keepAlive: true, maxSockets: 1 })
//     };

//     const req = https.request(ctx, res => {
//         let d = '';
//         res.on(
//             'data',
//             data => d += Buffer.from(data).toString()
//         );
//         res.on('end', () => cb (null, JSON.parse(d)))
//     });

//     req.on('error', err => cb(err));

//     req.end();
// }

// const fetch = promisify(request);

// const getFilms = async film => {
//     film = await fetch(
//         `/swapi/api/films/?${qs.stringify({ search: film })}`
//     );

//     film = film.count > 0 && film.results[0];

//     if (!film) {
//         return 'none';
//     }

//     let characters = [];

//     for (let i = 0; i < film.characters.length; i++) {
//         char = film.characters[i];

//         char = char.replace(/^.+people\//, '');

//         char = await fetch(`/swapi/api/people/${char}`);

//         characters.push(char.name);
//     }

//     return characters;
// }

// const getCharacters = async character => {
//     character = await fetch(
//         `/swapi/api/people/?${qs.stringify({ search: character })}`
//     );

//     character = character.count > 0 && character.results[0];

//     if (!character) {
//         return 'none';
//     }

//     let films = [];
// console.log(character);
//     for (let i = 0; i < character.films.length; i++) {
//         film = character.films[i];

//         film = film.replace(/^.+films\//, '');

//         film = await fetch(`/swapi/api/films/${film}`);

//         films.push(film.title);
//     }

//     return films;
// }

// async function run(film, character) {
// 	/*
// 	* Some work here; return type and arguments should be according to the problem's requirements
//     */
//     let characters = (await getFilms(film)).sort(),
//         films = (await getCharacters(character));

//     films = films !== 'none' ? films.sort().join(', ') : films;
//     characters = characters !== 'none' ? characters.sort().join(', ') : characters;


//     filmsAndCharacters = `${film}: ${characters}; ${character}: ${films}`
//     return filmsAndCharacters;
// }

// run("The Force Awakens", "Walter White").then(data => console.log(data))

const codes = {
    a: '.-',
    b: '-...',
    c: '-.-.',
    d: '-..',
    e: '.',
    f: '..-.',
    g: '--.',
    h: '....',
    i: '..',
    j: '.---',
    k: '-.-',
    l: '.-..',
    m: '--',
    n: '-.',
    o: '---',
    p: '.--.',
    q: '--.-',
    r: '.-.',
    s: '...',
    t: '-',
    u: '..-',
    v: '...-',
    w: '.--',
    x: '-..-',
    y: '-.--',
    z: '--..',
    '.': '.-.-.-'
}, eng = Object.keys(codes), mor = Object.values(codes);

function run(morseToEnglish, textToTranslate) {
	/*
	* Some work here; return type and arguments should be according to the problem's requirements
	*/

    translatedText = translate(
        textToTranslate.toLowerCase(),
        morseToEnglish ? '   ' : ' ',
        morseToEnglish ? ' ' : '',
        morseToEnglish
    );

    const first = translatedText.substr(0, 1);

    return `${first.toUpperCase()}${translatedText.substr(-(translatedText.length - 1))}`
}

const translate = (text, wordDelim, textDelim, morse) => {
    let words = text.split(wordDelim);

    words = words.map(word => {

        word = word.split(textDelim);

        return word;
    });

    for (let i = 0; i < words.length; i++) {
        let word = words[i];

    	if (word === '') {
    		return 'Invalid Morse Code Or Spacing'
    	}

        for (let j = 0; j < word.length; j++) {
    		if (word[j] === '') {
    			return 'Invalid Morse Code Or Spacing'
            }

    		if (morse) {
    			words[i][j] = eng[mor.indexOf(word[j])];
    		} else {
                words[i][j] = mor[eng.indexOf(word[j])]
            }
    	}
    }

    return morse ?
        words.reduce((t, v) => t += `${v.reduce((tt, vv) => tt += vv, '')} `, '').trim() :
        words.reduce((t, v) => t += `${v.reduce((tt, vv) => tt += `${vv} `, '')}   `, '').trim();
};
// const https = require('https'),
//     { promisify } = require('util'),
//     qs = require('querystring');

// const request = (path, cb) => {
//     const ctx = {
//         hostname: 'challenges.hackajob.co',
//         path,
//         agent: new https.Agent({ keepAlive: true, maxSockets: 1 })
//     };

//     const req = https.request(ctx, res => {
//         let d = '';
//         res.on(
//             'data',
//             data => d += Buffer.from(data).toString()
//         );
//         res.on('end', () => cb (null, JSON.parse(d)))
//     });

//     req.on('error', err => cb(err));

//     req.end();
// }

// const fetch = promisify(request);

// const getFilms = async film => {
//     film = await fetch(
//         `/swapi/api/films/?${qs.stringify({ search: film })}`
//     );

//     film = film.count > 0 && film.results[0];

//     if (!film) {
//         return 'none';
//     }

//     let characters = [];

//     for (let i = 0; i < film.characters.length; i++) {
//         char = film.characters[i];

//         char = char.replace(/^.+people\//, '');

//         char = await fetch(`/swapi/api/people/${char}`);

//         characters.push(char.name);
//     }

//     return characters;
// }

// const getCharacters = async character => {
//     character = await fetch(
//         `/swapi/api/people/?${qs.stringify({ search: character })}`
//     );

//     character = character.count > 0 && character.results[0];

//     if (!character) {
//         return 'none';
//     }

//     let films = [];
// console.log(character);
//     for (let i = 0; i < character.films.length; i++) {
//         film = character.films[i];

//         film = film.replace(/^.+films\//, '');

//         film = await fetch(`/swapi/api/films/${film}`);

//         films.push(film.title);
//     }

//     return films;
// }

// async function run(film, character) {
// 	/*
// 	* Some work here; return type and arguments should be according to the problem's requirements
//     */
//     let characters = (await getFilms(film)).sort(),
//         films = (await getCharacters(character));

//     films = films !== 'none' ? films.sort().join(', ') : films;
//     characters = characters !== 'none' ? characters.sort().join(', ') : characters;


//     filmsAndCharacters = `${film}: ${characters}; ${character}: ${films}`
//     return filmsAndCharacters;
// }

// run("The Force Awakens", "Walter White").then(data => console.log(data))

const codes = {
    a: '.-',
    b: '-...',
    c: '-.-.',
    d: '-..',
    e: '.',
    f: '..-.',
    g: '--.',
    h: '....',
    i: '..',
    j: '.---',
    k: '-.-',
    l: '.-..',
    m: '--',
    n: '-.',
    o: '---',
    p: '.--.',
    q: '--.-',
    r: '.-.',
    s: '...',
    t: '-',
    u: '..-',
    v: '...-',
    w: '.--',
    x: '-..-',
    y: '-.--',
    z: '--..',
    '.': '.-.-.-'
}, eng = Object.keys(codes), mor = Object.values(codes);

function run(morseToEnglish, textToTranslate) {
	/*
	* Some work here; return type and arguments should be according to the problem's requirements
	*/

    translatedText = translate(
        textToTranslate.toLowerCase(),
        morseToEnglish ? '   ' : ' ',
        morseToEnglish ? ' ' : '',
        morseToEnglish
    );

    return translatedText

    const first = translatedText.substr(0, 1);

    return `${first.toUpperCase()}${translatedText.substr(-(translatedText.length - 1))}`
}

const translate = (text, wordDelim, textDelim, morse) => {
    let words = text.split(wordDelim);

    words = words.map(word => {

        word = word.split(textDelim);

        return word;
    });

    for (let i = 0; i < words.length; i++) {
        let word = words[i];

    	if (word === '') {
    		return 'Invalid Morse Code Or Spacing'
    	}

        for (let j = 0; j < word.length; j++) {
    		if (word[j] === '') {
    			return 'Invalid Morse Code Or Spacing'
            }

    		if (morse) {
    			words[i][j] = eng[mor.indexOf(word[j])];
    		} else {
                words[i][j] = mor[eng.indexOf(word[j])]
            }
    	}
    }

    return morse ?
        words.reduce((t, v) => t += `${v.reduce((tt, vv) => tt += vv, '')} `, '').trim() :
        words.reduce((t, v) => t += `${v.reduce((tt, vv) => tt += `${vv} `, '')}  `, '').trim();
};
