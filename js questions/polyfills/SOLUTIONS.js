'use strict';
/* Reference solutions for polyfills/QUESTIONS.md. Run: node SOLUTIONS.js */

// ---------- A. Array methods ----------

Array.prototype.myMap = function (cb, thisArg) {
  if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this); // preserve holes
  }
  return out;
};

Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  }
  return out;
};

Array.prototype.myReduce = function (cb, initialValue) {
  if (typeof cb !== 'function') throw new TypeError(cb + ' is not a function');
  let acc = initialValue;
  let i = 0;
  const hasInit = arguments.length >= 2;
  if (!hasInit) {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError('Reduce of empty array with no initial value');
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = cb(acc, this[i], i, this);
  }
  return acc;
};

Array.prototype.myForEach = function (cb, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) cb.call(thisArg, this[i], i, this);
  }
  return undefined;
};

Array.prototype.mySome = function (cb, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) return true;
  }
  return false;
};

Array.prototype.myEvery = function (cb, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this && !cb.call(thisArg, this[i], i, this)) return false;
  }
  return true;
};

Array.prototype.myFind = function (cb, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (cb.call(thisArg, this[i], i, this)) return this[i];
  }
  return undefined;
};

Array.prototype.myFlat = function (depth = 1) {
  const out = [];
  const rec = (arr, d) => {
    for (let i = 0; i < arr.length; i++) {
      if (!(i in arr)) continue;
      if (Array.isArray(arr[i]) && d > 0) rec(arr[i], d - 1);
      else out.push(arr[i]);
    }
  };
  rec(this, depth);
  return out;
};

Array.prototype.myIncludes = function (target, fromIndex = 0) {
  const len = this.length;
  let start = fromIndex < 0 ? Math.max(len + fromIndex, 0) : fromIndex;
  for (let i = start; i < len; i++) {
    const v = this[i];
    if (v === target || (Number.isNaN(v) && Number.isNaN(target))) return true; // SameValueZero
  }
  return false;
};

function myArrayFrom(arrayLike, mapFn, thisArg) {
  const out = [];
  if (arrayLike == null) throw new TypeError('Cannot convert undefined or null to object');
  const iteratorFn = arrayLike[Symbol.iterator];
  if (typeof iteratorFn === 'function') {
    let i = 0;
    for (const item of arrayLike) out.push(mapFn ? mapFn.call(thisArg, item, i++) : item);
  } else {
    const len = Math.floor(Number(arrayLike.length)) || 0;
    for (let i = 0; i < len; i++) out.push(mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i]);
  }
  return out;
}

// ---------- B. Function methods ----------

Function.prototype.myCall = function (thisArg, ...args) {
  thisArg = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('fn');
  thisArg[key] = this;
  try {
    return thisArg[key](...args);
  } finally {
    delete thisArg[key];
  }
};

Function.prototype.myApply = function (thisArg, argsArray) {
  thisArg = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('fn');
  thisArg[key] = this;
  try {
    return thisArg[key](...(argsArray || []));
  } finally {
    delete thisArg[key];
  }
};

Function.prototype.myBind = function (thisArg, ...bound) {
  const targetFn = this;
  function boundFn(...called) {
    // `new boundFn()` → `this instanceof boundFn`; ignore thisArg, keep prototype
    const isNew = this instanceof boundFn;
    return targetFn.apply(isNew ? this : thisArg, [...bound, ...called]);
  }
  if (targetFn.prototype) boundFn.prototype = Object.create(targetFn.prototype);
  return boundFn;
};

// ---------- C. Object / misc ----------

function myObjectAssign(target, ...sources) {
  if (target == null) throw new TypeError('Cannot convert undefined or null to object');
  const to = Object(target);
  for (const src of sources) {
    if (src == null) continue;
    for (const key of Object.keys(src)) to[key] = src[key]; // getters invoked here
    for (const sym of Object.getOwnPropertySymbols(src)) {
      if (Object.getOwnPropertyDescriptor(src, sym).enumerable) to[sym] = src[sym];
    }
  }
  return to;
}

function myJSONStringify(value) {
  const type = typeof value;
  if (value === null) return 'null';
  if (type === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (type === 'boolean') return String(value);
  if (type === 'string') return JSON.stringify(value); // reuse for escaping only
  if (type === 'undefined' || type === 'function' || type === 'symbol') return undefined;
  if (typeof value.toJSON === 'function') return myJSONStringify(value.toJSON());
  if (Array.isArray(value)) {
    const items = value.map((v) => myJSONStringify(v) ?? 'null');
    return '[' + items.join(',') + ']';
  }
  const parts = [];
  for (const key of Object.keys(value)) {
    const sv = myJSONStringify(value[key]);
    if (sv !== undefined) parts.push(JSON.stringify(key) + ':' + sv);
  }
  return '{' + parts.join(',') + '}';
}

function get(obj, path, defaultValue) {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return defaultValue;
    cur = cur[k];
  }
  return cur === undefined ? defaultValue : cur;
}

function mySetInterval(fn, delay, ...args) {
  let cancelled = false;
  let id;
  const tick = () => {
    if (cancelled) return;
    fn(...args);
    if (!cancelled) id = setTimeout(tick, delay);
  };
  id = setTimeout(tick, delay);
  return () => { cancelled = true; clearTimeout(id); };
}

// ---------- self-checks ----------
let pass = 0, fail = 0;
const eq = (label, a, b) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`      expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  ok ? pass++ : fail++;
};

eq('myMap', [1, 2, 3].myMap((x) => x * 2), [2, 4, 6]);
eq('myMap holes preserved', JSON.stringify([1, , 3].myMap((x) => x * 2)), JSON.stringify([2, , 6]));
eq('myFilter', [1, 2, 3, 4].myFilter((x) => x % 2), [1, 3]);
eq('myReduce with init', [1, 2, 3].myReduce((a, b) => a + b, 10), 16);
eq('myReduce no init', [1, 2, 3].myReduce((a, b) => a + b), 6);
try { [].myReduce((a, b) => a + b); eq('myReduce empty throws', false, true); }
catch { eq('myReduce empty throws', true, true); }
eq('mySome', [1, 2, 3].mySome((x) => x > 2), true);
eq('myEvery', [1, 2, 3].myEvery((x) => x > 0), true);
eq('myFind', [1, 2, 3].myFind((x) => x === 2), 2);
eq('myFlat', [1, [2, [3, [4]]]].myFlat(2), [1, 2, 3, [4]]);
eq('myIncludes NaN', [NaN].myIncludes(NaN), true);
eq('myArrayFrom string', myArrayFrom('abc'), ['a', 'b', 'c']);
eq('myArrayFrom mapFn', myArrayFrom({ length: 3 }, (_, i) => i), [0, 1, 2]);

function greet(greeting, punct) { return greeting + ', ' + this.name + punct; }
eq('myCall', greet.myCall({ name: 'Sam' }, 'Hi', '!'), 'Hi, Sam!');
eq('myApply', greet.myApply({ name: 'Sam' }, ['Yo', '.']), 'Yo, Sam.');
const bound = greet.myBind({ name: 'Sam' }, 'Hey');
eq('myBind partial', bound('?'), 'Hey, Sam?');

function Point(x, y) { this.x = x; this.y = y; }
Point.prototype.sum = function () { return this.x + this.y; };
const BoundPoint = Point.myBind(null, 10);
const p = new BoundPoint(5);
eq('myBind + new keeps proto', p.sum(), 15);

eq('myObjectAssign', myObjectAssign({ a: 1 }, { b: 2 }, { a: 3 }), { a: 3, b: 2 });
eq('myJSONStringify obj', myJSONStringify({ a: 1, b: [1, undefined, 3], c: undefined, d: 'x' }),
  '{"a":1,"b":[1,null,3],"d":"x"}');
eq('myJSONStringify NaN', myJSONStringify({ n: NaN }), '{"n":null}');
eq('get deep path', get({ a: { b: [{ c: 42 }] } }, 'a.b[0].c'), 42);
eq('get default', get({ a: 1 }, 'a.b.c', 'def'), 'def');

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
