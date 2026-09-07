'use strict';

/**
 * Practice file for promise/QUESTIONS.md
 *
 * Fill in the stubs. Uncomment the tests at the bottom as you go.
 * Run: node practice.js
 */

// ----------------------------------------------------------------------------
// A. Polyfills
// ----------------------------------------------------------------------------

// Q1
function myPromiseAll(promises) {
  // TODO

  // const result =[];
  // for(let i=0; i<promises.length; i++){
  //   new Promise.resolve(promises[i]).then((result)=>)
  // }
}

// Q2
function myAllSettled(promises) {
  // TODO
}

// Q3
function myRace(promises) {
  // TODO
}

// Q4
function myAny(promises) {
  // TODO
}

// Q6 — implement from scratch
class MyPromise {
  constructor(executor) {
    // TODO: state, value, callback queues, resolve/reject, try/catch executor
  }
  then(onFulfilled, onRejected) {
    // TODO: return new MyPromise, schedule with queueMicrotask
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  finally(cb) {
    // TODO
  }
  static resolve(v) {
    // TODO
  }
  static reject(e) {
    // TODO
  }
}

// ----------------------------------------------------------------------------
// B / C. Control flow
// ----------------------------------------------------------------------------

// Q7
async function promiseAllWithConcurrency(tasks, limit) {
  // TODO
}

// Q9
async function retry(fn, retries, delayMs) {
  // TODO
}

// Q10
function promiseWithTimeout(promise, ms) {
  // TODO
}

// Q16
function memoizeAsync(fn) {
  // TODO
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ----------------------------------------------------------------------------
// Tiny test helper
// ----------------------------------------------------------------------------

let pass = 0;
let fail = 0;
async function expect(label, actualPromise, expected) {
  try {
    const actual = await actualPromise;
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    if (!ok) console.log(`      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    ok ? pass++ : fail++;
  } catch (e) {
    console.log(`FAIL  ${label} (threw: ${e && e.message})`);
    fail++;
  }
}
async function expectReject(label, actualPromise, matcher) {
  try {
    await actualPromise;
    console.log(`FAIL  ${label} (did not reject)`);
    fail++;
  } catch (e) {
    const ok = matcher ? matcher(e) : true;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    ok ? pass++ : fail++;
  }
}

// ----------------------------------------------------------------------------
// Tests — uncomment as you implement
// ----------------------------------------------------------------------------

(async function run() {
  // await expect('all: basic', myPromiseAll([1, Promise.resolve(2), 3]), [1, 2, 3]);
  // await expect('all: empty', myPromiseAll([]), []);
  // await expectReject('all: fail-fast', myPromiseAll([Promise.reject(new Error('x')), 2]));

  // await expect('allSettled', myAllSettled([Promise.resolve(1), Promise.reject('e')]), [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'e' },
  // ]);

  // await expect('race', myRace([sleep(50).then(() => 'slow'), sleep(10).then(() => 'fast')]), 'fast');

  // await expect('any', myAny([Promise.reject(1), Promise.resolve('ok')]), 'ok');
  // await expectReject('any: all reject', myAny([Promise.reject(1), Promise.reject(2)]),
  //   (e) => e.name === 'AggregateError');

  // await new MyPromise((res) => res(1)).then((v) => expect('MyPromise.then', Promise.resolve(v), 1));

  // let order = [];
  // const tasks = [200, 100, 50, 10].map((ms, i) => () => sleep(ms).then(() => { order.push(i); return i; }));
  // await expect('concurrency: order preserved', promiseAllWithConcurrency(tasks, 2), [0, 1, 2, 3]);

  // let n = 0;
  // await expect('retry: eventually succeeds',
  //   retry(async () => { if (++n < 3) throw new Error('no'); return 'yes'; }, 5, 1), 'yes');

  // await expect('timeout: passes through', promiseWithTimeout(sleep(10).then(() => 'ok'), 100), 'ok');
  // await expectReject('timeout: fires', promiseWithTimeout(sleep(100), 10));

  // const spy = (() => { let c = 0; return async (x) => { c++; await sleep(5); return [x, c]; }; })();
  // const m = memoizeAsync(spy);
  // await expect('memoize: shares in-flight', Promise.all([m('a'), m('a')]).then(([r]) => r), ['a', 1]);

  console.log(`\n${pass} passed, ${fail} failed`);
})();
