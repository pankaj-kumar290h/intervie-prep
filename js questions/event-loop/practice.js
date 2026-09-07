'use strict';
/*
 * Each block is one QUESTIONS.md snippet. Predict the exact log order FIRST,
 * then run `node practice.js` one block at a time (comment the others out).
 */

function Q1() {
  console.log('--- Q1 ---');
  console.log(1);
  setTimeout(() => console.log(2), 0);
  Promise.resolve().then(() => console.log(3));
  console.log(4);
}

function Q2() {
  console.log('--- Q2 ---');
  console.log('start');
  setTimeout(() => console.log('timeout'), 0);
  Promise.resolve().then(() => console.log('p1')).then(() => console.log('p2'));
  console.log('end');
}

function Q4() {
  console.log('--- Q4 ---');
  async function f() {
    console.log(1);
    await null;
    console.log(2);
  }
  console.log(3);
  f();
  console.log(4);
  Promise.resolve().then(() => console.log(5));
}

function Q5() {
  console.log('--- Q5 ---');
  console.log('A');
  setTimeout(() => console.log('B'), 0);
  Promise.resolve()
    .then(() => {
      console.log('C');
      return Promise.resolve();
    })
    .then(() => console.log('D'));
  queueMicrotask(() => console.log('E'));
  console.log('F');
}

function Q6() {
  console.log('--- Q6 (Node) ---');
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  process.nextTick(() => console.log('nextTick'));
  Promise.resolve().then(() => console.log('promise'));
}

function Q8() {
  console.log('--- Q8 ---');
  console.log(1);
  setTimeout(() => {
    console.log(2);
    Promise.resolve().then(() => console.log(3));
  }, 0);
  setTimeout(() => {
    console.log(4);
    Promise.resolve().then(() => console.log(5));
  }, 0);
  Promise.resolve().then(() => console.log(6));
  console.log(7);
}

// Run one at a time:
Q1();
// Q2();
// Q4();
// Q5();
// Q6();
// Q8();
