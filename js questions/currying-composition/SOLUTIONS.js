'use strict';
/* Reference solutions for currying-composition/QUESTIONS.md. Run: node SOLUTIONS.js */

// ---------- 1. generic curry ----------
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

// ---------- 2. curry with placeholders ----------
curry._ = Symbol('placeholder');
function curryWithPlaceholder(fn) {
  const _ = curry._;
  return function curried(...args) {
    const complete =
      args.length >= fn.length && !args.slice(0, fn.length).includes(_);
    if (complete) return fn.apply(this, args);
    return (...more) => {
      // fill placeholders left-to-right, then append the rest
      const merged = args.map((a) => (a === _ && more.length ? more.shift() : a));
      return curried.apply(this, [...merged, ...more]);
    };
  };
}

// ---------- 3. infinite sum ----------
// terminating on empty call
function sum(...first) {
  let total = first.reduce((a, b) => a + b, 0);
  function collector(...next) {
    if (next.length === 0) return total;
    total += next.reduce((a, b) => a + b, 0);
    return collector;
  }
  return first.length === 0 ? collector : collector;
}
// coercion variant: sum2(1)(2)(3) == 6
function sum2(a) {
  const fn = (b) => sum2(a + b);
  fn.valueOf = () => a;
  fn.toString = () => String(a);
  return fn;
}

// ---------- 4. curryN ----------
function curryN(n, fn) {
  return function curried(...args) {
    if (args.length >= n) return fn.apply(this, args.slice(0, n));
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

// ---------- 6-7. partial / partialRight ----------
function partial(fn, ...preset) {
  return (...later) => fn(...preset, ...later);
}
function partialRight(fn, ...preset) {
  return (...earlier) => fn(...earlier, ...preset);
}

// ---------- 9-10. compose / pipe ----------
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

// ---------- 11. async pipe ----------
const pipeAsync = (...fns) => (x) =>
  fns.reduce((acc, fn) => Promise.resolve(acc).then(fn), Promise.resolve(x));

// ---------- 13. tap ----------
const tap = (fn) => (x) => {
  fn(x);
  return x;
};

// ---------- 20. memoized + curried ----------
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

// ---------- self-checks ----------
let pass = 0, fail = 0;
const eq = (label, a, b) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`      expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  ok ? pass++ : fail++;
};

const add3 = (a, b, c) => a + b + c;
const cAdd = curry(add3);
eq('curry a,b,c', cAdd(1)(2)(3), 6);
eq('curry a,bc', cAdd(1)(2, 3), 6);
eq('curry abc', cAdd(1, 2, 3), 6);
eq('curry ab,c', cAdd(1, 2)(3), 6);

const _ = curry._;
const cp = curryWithPlaceholder(add3);
eq('placeholder middle', cp(_, 2)(1)(3), 6);
eq('placeholder first', cp(_, _, 3)(1)(2), 6);

eq('sum empty terminate', sum(1)(2)(3)(), 6);
eq('sum mixed arity', sum(1, 2)(3)(4)(), 10);
eq('sum2 coercion', sum2(1)(2)(3) == 6, true);
eq('sum2 + number', sum2(5)(5) + 0, 10);

const variadic = (...xs) => xs.reduce((a, b) => a + b, 0);
eq('curryN forces arity', curryN(3, variadic)(1)(2)(3), 6);

const greet = (greeting, name) => `${greeting}, ${name}!`;
eq('partial', partial(greet, 'Hello')('Sam'), 'Hello, Sam!');
eq('partialRight', partialRight(greet, 'Sam')('Hi'), 'Hi, Sam!');

const inc = (x) => x + 1;
const dbl = (x) => x * 2;
eq('compose right-to-left', compose(inc, dbl)(5), 11); // inc(dbl(5)) = 11
eq('pipe left-to-right', pipe(inc, dbl)(5), 12);        // dbl(inc(5)) = 12

const sideEffects = [];
eq('tap passes through', pipe(inc, tap((v) => sideEffects.push(v)), dbl)(1), 4);
eq('tap ran', sideEffects, [2]);

(async () => {
  const r = await pipeAsync(
    async (x) => x + 1,
    (x) => x * 3
  )(2);
  eq('pipeAsync', r, 9);

  let calls = 0;
  const slow = memoize((a, b) => { calls++; return a + b; });
  slow(1, 2); slow(1, 2); slow(2, 2);
  eq('memoize caches', calls, 2);

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exitCode = 1;
})();
