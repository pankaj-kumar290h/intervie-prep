'use strict';

/**
 * Reference solutions for promise/QUESTIONS.md.
 * Look only after you've attempted the question in practice.js.
 * Run: node SOLUTIONS.js  (executes the self-checks at the bottom)
 */

// ============================================================================
// A. Polyfills
// ============================================================================

// Q1 — Promise.all
function myPromiseAll(items) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(items);
    const results = new Array(arr.length);
    let remaining = arr.length;
    if (remaining === 0) return resolve(results);
    arr.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject); // first rejection wins; later ones are ignored (promise already settled)
    });
  });
}

// Q2 — Promise.allSettled
function myAllSettled(items) {
  const arr = Array.from(items);
  return Promise.all(
    arr.map((item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason })
      )
    )
  );
}

// Q3 — Promise.race
function myRace(items) {
  return new Promise((resolve, reject) => {
    for (const item of items) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
}

// Q4 — Promise.any
function myAny(items) {
  return new Promise((resolve, reject) => {
    const arr = Array.from(items);
    const errors = new Array(arr.length);
    let remaining = arr.length;
    if (remaining === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    arr.forEach((item, i) => {
      Promise.resolve(item).then(resolve, (err) => {
        errors[i] = err;
        if (--remaining === 0) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}

// Q5 — finally
function myFinally(promise, cb) {
  return promise.then(
    (value) => Promise.resolve(cb()).then(() => value),
    (reason) => Promise.resolve(cb()).then(() => { throw reason; })
  );
}

// Q6 — MyPromise from scratch
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  #state = PENDING;
  #value = undefined;
  #callbacks = []; // { onFulfilled, onRejected } queued while pending

  constructor(executor) {
    const resolve = (value) => this.#settle(FULFILLED, value);
    const reject = (reason) => this.#settle(REJECTED, reason);
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  #settle(state, value) {
    if (this.#state !== PENDING) return;
    // thenable assimilation
    if (state === FULFILLED && value && (typeof value === 'object' || typeof value === 'function')) {
      let then;
      try {
        then = value.then;
      } catch (err) {
        return this.#settle(REJECTED, err);
      }
      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            value,
            (v) => { if (!called) { called = true; this.#settle(FULFILLED, v); } },
            (e) => { if (!called) { called = true; this.#settle(REJECTED, e); } }
          );
        } catch (err) {
          if (!called) this.#settle(REJECTED, err);
        }
        return;
      }
    }
    this.#state = state;
    this.#value = value;
    this.#callbacks.forEach((cb) => this.#schedule(cb));
    this.#callbacks = [];
  }

  #schedule(cb) {
    queueMicrotask(() => {
      const handler = this.#state === FULFILLED ? cb.onFulfilled : cb.onRejected;
      if (typeof handler !== 'function') {
        // pass through
        this.#state === FULFILLED ? cb.resolve(this.#value) : cb.reject(this.#value);
        return;
      }
      try {
        cb.resolve(handler(this.#value));
      } catch (err) {
        cb.reject(err);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const cb = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === PENDING) this.#callbacks.push(cb);
      else this.#schedule(cb);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(cb) {
    return this.then(
      (v) => MyPromise.resolve(cb()).then(() => v),
      (e) => MyPromise.resolve(cb()).then(() => { throw e; })
    );
  }

  static resolve(v) {
    if (v instanceof MyPromise) return v;
    return new MyPromise((resolve) => resolve(v));
  }

  static reject(e) {
    return new MyPromise((_, reject) => reject(e));
  }
}

// ============================================================================
// B / C. Control flow
// ============================================================================

// Q7 / Q8 — bounded concurrency
async function promiseAllWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  const pool = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(pool);
  return results;
}

async function mapWithConcurrency(items, limit, asyncFn) {
  return promiseAllWithConcurrency(
    items.map((item, i) => () => asyncFn(item, i)),
    limit
  );
}

// Q9 — retry with exponential backoff
async function retry(fn, retries, delayMs) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      await sleep(delayMs * 2 ** attempt);
      attempt++;
    }
  }
}

// Q10 — timeout
function promiseWithTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Q11 — series / waterfall
function series(tasks) {
  return tasks.reduce(
    (chain, task) => chain.then((acc) => task().then((r) => [...acc, r])),
    Promise.resolve([])
  );
}
function waterfall(tasks, initial) {
  return tasks.reduce((chain, task) => chain.then(task), Promise.resolve(initial));
}

// Q14 — sequence via reduce
function runInSequence(asyncFns) {
  return asyncFns.reduce(
    (p, fn) => p.then((results) => fn().then((r) => results.concat(r))),
    Promise.resolve([])
  );
}

// Q16 — memoizeAsync (share in-flight, don't cache rejections)
function memoizeAsync(fn, keyFn = (...a) => JSON.stringify(a)) {
  const cache = new Map();
  return function (...args) {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const p = Promise.resolve(fn.apply(this, args)).catch((err) => {
      cache.delete(key); // failure is not cached
      throw err;
    });
    cache.set(key, p);
    return p;
  };
}

// Q17 — cancellable promise
function makeCancellable(promise) {
  let cancelled = false;
  const wrapped = new Promise((resolve, reject) => {
    promise.then(
      (v) => (cancelled ? undefined : resolve(v)),
      (e) => (cancelled ? undefined : reject(e))
    );
  });
  wrapped.cancel = () => { cancelled = true; };
  return wrapped;
}

// Q30 — FIFO promise queue
class PromiseQueue {
  #tail = Promise.resolve();
  add(taskFn) {
    const result = this.#tail.then(() => taskFn());
    // keep the chain alive even if a task rejects
    this.#tail = result.catch(() => {});
    return result;
  }
}

// Q32 — promisify
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, ...rest) => {
        if (err) reject(err);
        else resolve(rest.length > 1 ? rest : rest[0]);
      });
    });
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// Self-checks
// ============================================================================

let pass = 0;
let fail = 0;
async function check(label, run, expected) {
  try {
    const actual = await run();
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    if (!ok) console.log(`      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    ok ? pass++ : fail++;
  } catch (e) {
    console.log(`FAIL  ${label} (threw: ${e && e.message})`);
    fail++;
  }
}
async function checkReject(label, run, matcher) {
  try {
    await run();
    console.log(`FAIL  ${label} (did not reject)`);
    fail++;
  } catch (e) {
    const ok = matcher ? matcher(e) : true;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
    ok ? pass++ : fail++;
  }
}

(async function main() {
  await check('Q1 all: basic', () => myPromiseAll([1, Promise.resolve(2), 3]), [1, 2, 3]);
  await check('Q1 all: empty', () => myPromiseAll([]), []);
  await checkReject('Q1 all: fail-fast', () => myPromiseAll([Promise.reject(new Error('x')), 2]));

  await check('Q2 allSettled', () => myAllSettled([Promise.resolve(1), Promise.reject('e')]), [
    { status: 'fulfilled', value: 1 },
    { status: 'rejected', reason: 'e' },
  ]);

  await check('Q3 race', () => myRace([sleep(50).then(() => 'slow'), sleep(5).then(() => 'fast')]), 'fast');

  await check('Q4 any: first fulfilled', () => myAny([Promise.reject(1), Promise.resolve('ok')]), 'ok');
  await checkReject('Q4 any: all reject', () => myAny([Promise.reject(1), Promise.reject(2)]),
    (e) => e.name === 'AggregateError' && e.errors.length === 2);

  await check('Q5 finally: keeps value', () => myFinally(Promise.resolve('v'), () => 'ignored'), 'v');
  await checkReject('Q5 finally: throw propagates', () => myFinally(Promise.resolve('v'), () => { throw new Error('f'); }));

  await check('Q6 MyPromise: chain', () =>
    new MyPromise((res) => res(1)).then((v) => v + 1).then((v) => v * 3), 6);
  await check('Q6 MyPromise: catch recovers', () =>
    new MyPromise((_, rej) => rej(new Error('e'))).catch(() => 'recovered'), 'recovered');
  await check('Q6 MyPromise: thenable assimilation', () =>
    MyPromise.resolve({ then: (r) => r(42) }).then((v) => v), 42);
  await check('Q6 MyPromise: async ordering', async () => {
    const log = [];
    const p = new MyPromise((r) => r()).then(() => log.push('micro'));
    log.push('sync');
    await p;
    return log;
  }, ['sync', 'micro']);

  await check('Q7 concurrency: order preserved', () => {
    const tasks = [40, 30, 20, 10].map((ms, i) => () => sleep(ms).then(() => i));
    return promiseAllWithConcurrency(tasks, 2);
  }, [0, 1, 2, 3]);

  await check('Q7 concurrency: never exceeds limit', async () => {
    let active = 0;
    let max = 0;
    const tasks = Array.from({ length: 8 }, () => async () => {
      active++; max = Math.max(max, active);
      await sleep(10);
      active--;
    });
    await promiseAllWithConcurrency(tasks, 3);
    return max;
  }, 3);

  await check('Q9 retry: eventually succeeds', () => {
    let n = 0;
    return retry(async () => { if (++n < 3) throw new Error('no'); return 'yes'; }, 5, 1);
  }, 'yes');
  await checkReject('Q9 retry: exhausts', () => retry(async () => { throw new Error('always'); }, 2, 1));

  await check('Q10 timeout: passes through', () => promiseWithTimeout(sleep(5).then(() => 'ok'), 100), 'ok');
  await checkReject('Q10 timeout: fires', () => promiseWithTimeout(sleep(100), 10),
    (e) => e.message === 'Timeout');

  await check('Q11 waterfall', () => waterfall([
    (x) => Promise.resolve(x + 1),
    (x) => Promise.resolve(x * 10),
  ], 1), 20);

  await check('Q16 memoize: shares in-flight call', async () => {
    let calls = 0;
    const fn = memoizeAsync(async (x) => { calls++; await sleep(5); return x.toUpperCase(); });
    const [a, b] = await Promise.all([fn('a'), fn('a')]);
    return [a, b, calls];
  }, ['A', 'A', 1]);
  await check('Q16 memoize: rejection not cached', async () => {
    let calls = 0;
    const fn = memoizeAsync(async () => { calls++; if (calls === 1) throw new Error('first'); return 'ok'; });
    await fn('k').catch(() => {});
    const r = await fn('k');
    return [r, calls];
  }, ['ok', 2]);

  await check('Q17 cancellable: cancel silences', async () => {
    let settled = 'no';
    const c = makeCancellable(sleep(10).then(() => 'done'));
    c.then(() => (settled = 'resolved'), () => (settled = 'rejected'));
    c.cancel();
    await sleep(30);
    return settled;
  }, 'no');

  await check('Q30 PromiseQueue: FIFO', async () => {
    const q = new PromiseQueue();
    const order = [];
    const p1 = q.add(async () => { await sleep(20); order.push(1); });
    const p2 = q.add(async () => { await sleep(1); order.push(2); });
    const p3 = q.add(async () => { order.push(3); });
    await Promise.all([p1, p2, p3]);
    return order;
  }, [1, 2, 3]);

  await check('Q32 promisify', () => {
    const cbStyle = (a, b, cb) => setTimeout(() => cb(null, a + b), 1);
    return promisify(cbStyle)(2, 3);
  }, 5);

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) process.exitCode = 1;
})();

module.exports = {
  myPromiseAll, myAllSettled, myRace, myAny, myFinally, MyPromise,
  promiseAllWithConcurrency, mapWithConcurrency, retry, promiseWithTimeout,
  series, waterfall, runInSequence, memoizeAsync, makeCancellable, PromiseQueue, promisify,
};
