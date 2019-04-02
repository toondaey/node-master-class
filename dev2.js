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

const a = [1,2,3,4,5,6,7,8,9,0,];


function fromBehind(arr, pos) {
    let behind = arr, forward = arr, i = 0, val;

    while (i < arr.length) {
        console.log(i)
        if (i > pos) val = arr[i]
        i++
    }

    return val;
}

console.log(fromBehind(a, 2))
