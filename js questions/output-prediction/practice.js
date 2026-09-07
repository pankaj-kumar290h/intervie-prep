'use strict';
/*
 * Runs a curated subset of the QUESTIONS.md snippets and prints the REAL output.
 * Predict each one out loud FIRST, then run: node practice.js
 * Full answers + reasons are in SOLUTIONS.md.
 */

const q = (n, fn) => {
  process.stdout.write(`\n[Q${n}] `);
  try { fn(); } catch (e) { console.log('THREW:', e.constructor.name, '-', e.message); }
};

q(1, () => console.log(0.1 + 0.2 === 0.3));
q(2, () => console.log([] == ![]));
q(4, () => console.log(NaN === NaN, Object.is(NaN, NaN)));
q(5, () => console.log(typeof null, typeof NaN, typeof [], typeof function () {}));
q(6, () => console.log(1 < 2 < 3, 3 > 2 > 1));
q(7, () => console.log('5' - 3, '5' + 3, '5' * '2'));
q(9, () => console.log(true + true + true));
q(10, () => console.log(+'', +'  ', +'0x10', +null, +undefined, +[], +[1], +[1, 2]));

q(11, () => {
  const out = [];
  for (let i = 0; i < 3; i++) out.push(() => i);
  console.log('let  =>', out.map((f) => f()));
});

q(13, () => {
  var a = 10;
  function foo() { console.log(a); var a = 20; }
  foo();
});

q(15, () => {
  const o = { n: 1, get() { return this.n; } };
  const g = o.get;
  console.log(o.get(), (() => { try { return g(); } catch { return 'threw'; } })());
});

q(17, () => {
  function F() { this.x = 1; return { x: 2 }; }
  console.log(new F().x);
});

q(18, () => {
  console.log(1);
  setTimeout(() => console.log(2));
  Promise.resolve().then(() => console.log(3));
  console.log(4);
});

q(19, () => {
  (async function f() {
    console.log('a');
    await 0;
    console.log('b');
  })();
  console.log('sync-after-call');
});

q(21, () => Promise.resolve(1).then(() => 2).then(3).then((v) => console.log('Q21 ->', v)));

q(25, () => console.log([1, 2, 3].map(parseInt)));
q(26, () => console.log([1, 2, 10].sort()));
q(29, () => console.log(JSON.stringify({ a: undefined, b: () => {}, c: NaN, d: [undefined] })));
q(30, () => console.log([...new Set([1, '1', 1, NaN, NaN])]));
q(32, () => console.log(0.1.toFixed(20)));
q(35, () => console.log(parseInt('0.0000005'), (0.0000005).toString()));

q(40, () => {
  const x = { valueOf: () => 10, toString: () => '20' };
  console.log(x + 1, `${x}`, x == 10);
});

setTimeout(() => console.log('\n(Q18/Q19 timer callbacks ran last, as expected)'), 10);
