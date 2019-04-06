// function run(number) {
//     if (number < 6) {
//         return false;
//     }

//     let factors = [];

//     for (i = 2; i < number; i++) {
//         if (!(number % i)) {
//             factors.push(i);
//         }
//     }

//     const semiLength = factors.filter(v => isPrime(v)).length;

//     return semiLength === 2;
// };

// const isPrime = (n) => {
//     const limit = Math.floor(Math.sqrt(n));

//     for (let i = 2; i <= limit; i++)
//         if (n % i === 0) return false;


//     return true;
// };


// console.log(run(77));

// function* fib() {
//     let prev = 1, curr = 0;

//     while (true) {
//         yield curr;

//         curr += prev;

//         prev = curr - prev;
//     }
// }

// const gen = fib();

const r = (start, end, res, _rev) => {
    res = Array.isArray(res) ? res : res;

    if (start === end) {
        res.push(end - start + (_rev ? 0 : start));

        return res;
    }

    res.push(Math.abs((_rev ? 0 : -end) + end - start));

    return r(start + 1, end, res, _rev);
}

const range = (start, end) => r(start, end, []);

const a = range(0, 1200);

let start = Date.now();

function fromBehind(arr, pos, back, curr) {
    back = back ? back : 0;
    curr = curr ? curr : 0;

    if (back == arr.length) return arr[curr];

    if (back++ > pos) ++curr;

    return fromBehind(arr, pos, back, curr);

    // while (i < arr.length) if (i++ > pos) revI++;

    // return arr[revI];
}

console.log(fromBehind(a, 1100));

let end = Date.now();

console.log(end - start);
console.log('')

start = Date.now();
const fromBehind2 = (arr, pos) => {
    let i = 0, revI = 0;

    while (i < arr.length) if (i++ > pos) revI++;

    return arr[revI];
};

console.log(fromBehind2(a, 1100));
end = Date.now();
console.log(end - start)

// const fact = (n, f, a) => {
//     if (n-- < 2) {
//         f.push(a - 0);
//         return f;
//     }

//     f.push(a - n);

//     return fact(n, f, a);
// };

// const factorial = (n) => fact(n, [], n);

// console.log(factorial(5));
