'use strict';
/*
 * Practice scratch file — implement the functions from QUESTIONS.md here.
 * A tiny assert helper is provided. Run: node practice.js
 */

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  ok ? pass++ : fail++;
}
async function checkAsync(label, run, expected) {
  try { check(label, await run(), expected); }
  catch (e) { console.log(`FAIL  ${label} (threw: ${e && e.message})`); fail++; }
}

// ---- your implementations ----


// ---- your tests ----
(async function () {
  // check('example', 1 + 1, 2);

  console.log(`\n${pass} passed, ${fail} failed`);
})();
