'use strict';
/* Reference solutions for objects-cloning/QUESTIONS.md. Run: node SOLUTIONS.js */

// ---------- 1-5. deepClone ----------
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value); // circular

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    const out = new Map();
    seen.set(value, out);
    for (const [k, v] of value) out.set(deepClone(k, seen), deepClone(v, seen));
    return out;
  }
  if (value instanceof Set) {
    const out = new Set();
    seen.set(value, out);
    for (const v of value) out.add(deepClone(v, seen));
    return out;
  }
  if (Array.isArray(value)) {
    const out = [];
    seen.set(value, out);
    for (let i = 0; i < value.length; i++) out[i] = deepClone(value[i], seen);
    return out;
  }

  // plain / custom objects: preserve prototype + descriptors (getters etc.)
  const out = Object.create(Object.getPrototypeOf(value));
  seen.set(value, out);
  for (const key of Reflect.ownKeys(value)) {
    const desc = Object.getOwnPropertyDescriptor(value, key);
    if ('value' in desc) desc.value = deepClone(desc.value, seen);
    Object.defineProperty(out, key, desc);
  }
  return out;
}

// ---------- 8-10. deepEqual ----------
function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true; // handles NaN, but also +0/-0 as NOT equal
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;

  if (a.constructor !== b.constructor) return false;
  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  if (seen.get(a) === b) return true;
  seen.set(a, b);

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k], seen));
}

// ---------- 11. shallowEqual ----------
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.is(a[k], b[k]));
}

// ---------- 12. deepFreeze ----------
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const key of Reflect.ownKeys(obj)) {
    deepFreeze(obj[key], seen);
  }
  return Object.freeze(obj);
}

// ---------- 14-15. setIn / getIn ----------
function toPath(path) {
  return Array.isArray(path)
    ? path
    : path.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);
}
function getIn(obj, path, defaultValue) {
  const keys = toPath(path);
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return defaultValue;
    cur = cur[k];
  }
  return cur === undefined ? defaultValue : cur;
}
function setIn(obj, path, value) {
  const keys = toPath(path);
  if (keys.length === 0) return value;
  const [head, ...rest] = keys;
  const clone = Array.isArray(obj) ? obj.slice() : { ...obj };
  clone[head] = rest.length ? setIn(obj?.[head] ?? {}, rest, value) : value;
  return clone;
}

// ---------- 16. mergeDeep ----------
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && (v.constructor === Object || v.constructor === undefined);

function mergeDeep(target, ...sources) {
  const out = { ...target };
  for (const src of sources) {
    for (const key of Object.keys(src)) {
      if (isPlainObject(out[key]) && isPlainObject(src[key])) {
        out[key] = mergeDeep(out[key], src[key]);
      } else {
        out[key] = src[key];
      }
    }
  }
  return out;
}

// ---------- 22. flatten / unflatten ----------
function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(val) && Object.keys(val).length) flattenObject(val, path, out);
    else out[path] = val;
  }
  return out;
}
function unflatten(flat) {
  const out = {};
  for (const [path, val] of Object.entries(flat)) {
    const keys = path.split('.');
    let cur = out;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) cur[k] = val;
      else cur = cur[k] ??= {};
    });
  }
  return out;
}

// ---------- 19-20. invert / mapValues ----------
const invert = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
const mapValues = (obj, fn) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));

// ---------- 21. groupBy ----------
const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});

// ---------- self-checks ----------
let pass = 0, fail = 0;
const ok = (label, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  cond ? pass++ : fail++;
};

// deepClone
{
  const orig = {
    n: 1, s: 'x', d: new Date(0), re: /ab/gi,
    arr: [1, { y: 2 }], map: new Map([['k', { v: 1 }]]), set: new Set([1, 2]),
  };
  orig.self = orig; // circular
  const c = deepClone(orig);
  ok('deepClone: not same ref', c !== orig);
  ok('deepClone: nested copied', c.arr[1] !== orig.arr[1] && c.arr[1].y === 2);
  ok('deepClone: Date', c.d instanceof Date && c.d.getTime() === 0);
  ok('deepClone: RegExp', c.re.source === 'ab' && c.re.flags === 'gi');
  ok('deepClone: Map deep', c.map.get('k') !== orig.map.get('k') && c.map.get('k').v === 1);
  ok('deepClone: Set', [...c.set].join() === '1,2');
  ok('deepClone: circular preserved', c.self === c);
}

// deepEqual
ok('deepEqual: nested', deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
ok('deepEqual: NaN', deepEqual(NaN, NaN));
ok('deepEqual: diff key count', !deepEqual({ a: 1 }, { a: 1, b: 2 }));
ok('deepEqual: Map', deepEqual(new Map([['a', 1]]), new Map([['a', 1]])));
ok('deepEqual: Date', deepEqual(new Date(1), new Date(1)));
{
  const a = { x: 1 }; a.self = a;
  const b = { x: 1 }; b.self = b;
  ok('deepEqual: circular', deepEqual(a, b));
}

// shallowEqual
ok('shallowEqual: same prims', shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }));
ok('shallowEqual: nested differ', !shallowEqual({ a: { x: 1 } }, { a: { x: 1 } }));

// deepFreeze
{
  const o = deepFreeze({ a: { b: 1 } });
  try { o.a.b = 2; } catch {}
  ok('deepFreeze: nested frozen', o.a.b === 1 && Object.isFrozen(o.a));
}

// setIn / getIn — immutability
{
  const state = { user: { name: 'A', tags: ['x'] }, count: 0 };
  const next = setIn(state, 'user.name', 'B');
  ok('setIn: new value', getIn(next, 'user.name') === 'B');
  ok('setIn: original untouched', state.user.name === 'A');
  ok('setIn: sibling shared', next.user.tags === state.user.tags);
  ok('setIn: changed path copied', next.user !== state.user);
  ok('getIn: default', getIn(state, 'user.address.city', 'N/A') === 'N/A');
}

// mergeDeep
ok('mergeDeep', deepEqual(
  mergeDeep({ a: { x: 1 }, b: 1 }, { a: { y: 2 }, c: 3 }),
  { a: { x: 1, y: 2 }, b: 1, c: 3 }
));

// flatten / unflatten
{
  const nested = { a: { b: { c: 1 }, d: 2 }, e: 3 };
  const flat = flattenObject(nested);
  ok('flattenObject', deepEqual(flat, { 'a.b.c': 1, 'a.d': 2, e: 3 }));
  ok('unflatten roundtrip', deepEqual(unflatten(flat), nested));
}

ok('invert', deepEqual(invert({ a: '1', b: '2' }), { 1: 'a', 2: 'b' }));
ok('mapValues', deepEqual(mapValues({ a: 1, b: 2 }, (v) => v * 10), { a: 10, b: 20 }));
ok('groupBy', deepEqual(
  groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even')),
  { odd: [1, 3], even: [2, 4] }
));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
