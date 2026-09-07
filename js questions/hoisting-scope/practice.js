'use strict';
/*
 * Predict each snippet's output/error FIRST, then uncomment and run: node practice.js
 * Answers: reason from the rules at the bottom of QUESTIONS.md.
 * NOTE: some snippets throw on purpose — wrap in try/catch or run individually.
 */

function Q1() {
  var a;
  console.log(a); // ?
  a = 1;
  console.log(a);
}

function Q4() {
  var x = 1; // outer (shadowed below)
  return (function f() {
    console.log(x); // ?
    var x = 2;
    return x;
  })();
}

function Q5() {
  for (var i = 0; i < 3; i++) {}
  console.log(i); // ?
  for (let j = 0; j < 3; j++) {}
  console.log(typeof j); // ?
}

function Q7() {
  function f() {
    return g();
    function g() { return 1; }
    // eslint-disable-next-line no-unreachable
    var g = function () { return 2; };
  }
  console.log(f()); // ?
}

function Q9() {
  if (false) { var x = 1; }
  console.log(x); // ?
  console.log(typeof y); // y never declared -> ?
}

function Q14() {
  const funcs = [];
  for (var i = 0; i < 3; i++) funcs.push(() => i);
  console.log(funcs.map((f) => f())); // ?
}

Q1();
// Q4();
// Q5();
// Q7();
// Q9();
// Q14();
