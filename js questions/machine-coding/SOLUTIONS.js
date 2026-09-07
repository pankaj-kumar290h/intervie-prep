'use strict';
/* Reference solutions for machine-coding/QUESTIONS.md (the high-frequency ones).
   Run: node SOLUTIONS.js */

// ============================================================
// 1. EventEmitter
// ============================================================
class EventEmitter {
  #listeners = new Map(); // event -> Set<fn>

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(fn);
    return () => this.off(event, fn); // unsubscribe handle
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    wrapper.original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    const set = this.#listeners.get(event);
    if (!set) return this;
    for (const l of set) {
      if (l === fn || l.original === fn) set.delete(l);
    }
    if (set.size === 0) this.#listeners.delete(event);
    return this;
  }

  emit(event, ...args) {
    const set = this.#listeners.get(event);
    if (!set || set.size === 0) return false;
    for (const fn of [...set]) fn(...args);
    return true;
  }

  listenerCount(event) {
    return this.#listeners.get(event)?.size ?? 0;
  }
}

// ============================================================
// 2. LRUCache — O(1) get/put via Map insertion order
// ============================================================
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key); // re-insert to make it most-recently-used
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const lruKey = this.map.keys().next().value; // first = least recently used
      this.map.delete(lruKey);
    }
  }
}

// ============================================================
// 3. mini-Redux
// ============================================================
function createStore(reducer, preloadedState) {
  let state = preloadedState;
  let listeners = [];

  const getState = () => state;
  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach((l) => l());
    return action;
  };
  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };
  dispatch({ type: '@@INIT' });
  return { getState, dispatch, subscribe };
}

function combineReducers(reducersMap) {
  return function rootReducer(state = {}, action) {
    const next = {};
    let changed = false;
    for (const key of Object.keys(reducersMap)) {
      next[key] = reducersMap[key](state[key], action);
      if (next[key] !== state[key]) changed = true;
    }
    return changed ? next : state;
  };
}

// ============================================================
// 4. deep _.get / _.set
// ============================================================
const toPath = (p) =>
  Array.isArray(p) ? p : p.replace(/\[(\w+)\]/g, '.$1').split('.').filter(Boolean);

function _get(obj, path, def) {
  let cur = obj;
  for (const k of toPath(path)) {
    if (cur == null) return def;
    cur = cur[k];
  }
  return cur === undefined ? def : cur;
}

function _set(obj, path, value) {
  const keys = toPath(path);
  let cur = obj;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      cur[k] = value;
    } else {
      if (typeof cur[k] !== 'object' || cur[k] === null) {
        cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      }
      cur = cur[k];
    }
  });
  return obj;
}

// ============================================================
// 11. Task scheduler with concurrency limit
// ============================================================
class Scheduler {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  add(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.#next();
    });
  }

  #next() {
    while (this.running < this.limit && this.queue.length) {
      const { taskFn, resolve, reject } = this.queue.shift();
      this.running++;
      Promise.resolve()
        .then(taskFn)
        .then(resolve, reject)
        .finally(() => {
          this.running--;
          this.#next();
        });
    }
  }
}

// ============================================================
// 27. Calculator — tokenize -> shunting-yard -> eval RPN
// ============================================================
function calculate(expr) {
  const tokens = expr.match(/\d+\.?\d*|[+\-*/()]/g) || [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output = [];
  const ops = [];
  for (const t of tokens) {
    if (/\d/.test(t)) {
      output.push(parseFloat(t));
    } else if (t in prec) {
      while (ops.length && ops.at(-1) in prec && prec[ops.at(-1)] >= prec[t]) {
        output.push(ops.pop());
      }
      ops.push(t);
    } else if (t === '(') {
      ops.push(t);
    } else if (t === ')') {
      while (ops.at(-1) !== '(') output.push(ops.pop());
      ops.pop();
    }
  }
  while (ops.length) output.push(ops.pop());

  const stack = [];
  for (const t of output) {
    if (typeof t === 'number') {
      stack.push(t);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : a / b);
    }
  }
  return stack[0];
}

// ============================================================
// 35. Undo/redo manager
// ============================================================
class History {
  constructor(initial) {
    this.past = [];
    this.present = initial;
    this.future = [];
  }
  push(next) {
    this.past.push(this.present);
    this.present = next;
    this.future = [];
  }
  undo() {
    if (!this.past.length) return this.present;
    this.future.unshift(this.present);
    this.present = this.past.pop();
    return this.present;
  }
  redo() {
    if (!this.future.length) return this.present;
    this.past.push(this.present);
    this.present = this.future.shift();
    return this.present;
  }
}

// ============================================================
// self-checks
// ============================================================
let pass = 0, fail = 0;
const ok = (label, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  cond ? pass++ : fail++;
};
const eq = (label, a, b) => ok(label, JSON.stringify(a) === JSON.stringify(b));

// EventEmitter
{
  const ee = new EventEmitter();
  const seen = [];
  const unsub = ee.on('x', (v) => seen.push(['on', v]));
  ee.once('x', (v) => seen.push(['once', v]));
  ee.emit('x', 1);
  ee.emit('x', 2);
  unsub();
  ee.emit('x', 3);
  eq('EventEmitter: on + once semantics', seen, [['on', 1], ['once', 1], ['on', 2]]);
  ok('EventEmitter: emit unknown returns false', ee.emit('nope') === false);
  ok('EventEmitter: listenerCount', ee.listenerCount('x') === 0);
}

// LRUCache
{
  const c = new LRUCache(2);
  c.put(1, 1);
  c.put(2, 2);
  ok('LRU: get 1', c.get(1) === 1);
  c.put(3, 3); // evicts 2 (LRU)
  ok('LRU: 2 evicted', c.get(2) === -1);
  c.put(4, 4); // evicts 1
  ok('LRU: 1 evicted', c.get(1) === -1);
  ok('LRU: 3 present', c.get(3) === 3);
  ok('LRU: 4 present', c.get(4) === 4);
}

// mini-Redux
{
  const counter = (state = 0, action) =>
    action.type === 'inc' ? state + 1 : action.type === 'dec' ? state - 1 : state;
  const store = createStore(combineReducers({ count: counter }));
  const seen = [];
  store.subscribe(() => seen.push(store.getState().count));
  store.dispatch({ type: 'inc' });
  store.dispatch({ type: 'inc' });
  store.dispatch({ type: 'dec' });
  eq('Redux: state transitions', seen, [1, 2, 1]);
  ok('Redux: getState', store.getState().count === 1);
}

// _.get / _.set
{
  const obj = { a: { b: [{ c: 1 }] } };
  ok('_get deep', _get(obj, 'a.b[0].c') === 1);
  ok('_get default', _get(obj, 'a.x.y', 'def') === 'def');
  _set(obj, 'a.b[1].d', 9);
  ok('_set creates path', obj.a.b[1].d === 9 && Array.isArray(obj.a.b));
}

// Scheduler
{
  const order = [];
  const s = new Scheduler(2);
  let active = 0, maxActive = 0;
  const make = (id, ms) => () =>
    new Promise((res) => {
      active++; maxActive = Math.max(maxActive, active);
      setTimeout(() => { active--; order.push(id); res(id); }, ms);
    });
  Promise.all([s.add(make('a', 30)), s.add(make('b', 10)), s.add(make('c', 10)), s.add(make('d', 5))])
    .then((results) => {
      eq('Scheduler: all resolved in call order', results, ['a', 'b', 'c', 'd']);
      ok('Scheduler: never exceeds limit', maxActive === 2);

      // Calculator
      ok('calc: precedence', calculate('2 + 3 * 4') === 14);
      ok('calc: parens', calculate('(2 + 3) * 4') === 20);
      ok('calc: division', calculate('10 / 2 - 3') === 2);

      // History
      const h = new History('v0');
      h.push('v1'); h.push('v2');
      ok('History: undo', h.undo() === 'v1');
      ok('History: undo again', h.undo() === 'v0');
      ok('History: redo', h.redo() === 'v1');
      h.push('v3');
      ok('History: push clears future', h.redo() === 'v3');

      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    });
}
