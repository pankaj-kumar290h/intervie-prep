'use strict';
/* Reference solutions for debounce-throttle/QUESTIONS.md. Run: node SOLUTIONS.js */

// ---------- 1-3. debounce with leading/trailing + cancel/flush ----------
function debounce(fn, wait, { leading = false, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  function invoke() {
    result = fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
    return result;
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    const callNow = leading && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) invoke();
    }, wait);
    if (callNow) invoke();
    return result;
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer);
      timer = null;
      return invoke();
    }
    return result;
  };
  return debounced;
}

// ---------- 4. debounce returning a promise ----------
function debounceAsync(fn, wait) {
  let timer = null;
  let resolvers = [];
  return function (...args) {
    return new Promise((resolve, reject) => {
      resolvers.push({ resolve, reject });
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const batch = resolvers;
        resolvers = [];
        timer = null;
        try {
          const value = await fn.apply(this, args);
          batch.forEach((r) => r.resolve(value));
        } catch (err) {
          batch.forEach((r) => r.reject(err));
        }
      }, wait);
    });
  };
}

// ---------- 5-6. throttle (Lodash semantics: leading + trailing) ----------
function throttle(fn, wait, { leading = true, trailing = true } = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;

  function invoke(time) {
    lastCallTime = time;
    fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
  }

  function throttled(...args) {
    const now = Date.now();
    if (!lastCallTime && !leading) lastCallTime = now;
    const remaining = wait - (now - lastCallTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timer) { clearTimeout(timer); timer = null; }
      invoke(now);
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        timer = null;
        invoke(leading ? Date.now() : 0);
      }, remaining);
    }
  }

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastCallTime = 0;
    lastArgs = lastThis = null;
  };
  return throttled;
}

// ---------- 8. rafThrottle (fake rAF in Node) ----------
const raf =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (cb) => setTimeout(() => cb(Date.now()), 16);

function rafThrottle(fn) {
  let scheduled = false;
  let lastArgs;
  return function (...args) {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    raf(() => {
      scheduled = false;
      fn.apply(this, lastArgs);
    });
  };
}

// ---------- 9. once ----------
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

// ---------- 10. after / before ----------
function after(n, fn) {
  return function (...args) {
    if (--n < 1) return fn.apply(this, args);
  };
}
function before(n, fn) {
  let result;
  return function (...args) {
    if (--n > 0) result = fn.apply(this, args);
    return result;
  };
}

// ---------- 12. token-bucket rate limiter ----------
function createRateLimiter({ tokens, interval }) {
  let available = tokens;
  const queue = [];
  const handle = setInterval(() => {
    available = tokens;
    while (available > 0 && queue.length) {
      available--;
      queue.shift()();
    }
  }, interval);

  const acquire = function () {
    return new Promise((resolve) => {
      if (available > 0) {
        available--;
        resolve();
      } else {
        queue.push(resolve);
      }
    });
  };
  acquire.stop = () => clearInterval(handle);
  return acquire;
}

// ---------- 13. batch ----------
function batch(fn, { maxSize = 10, maxWait = 100 } = {}) {
  let items = [];
  let timer = null;
  const flush = () => {
    if (!items.length) return;
    const batchItems = items;
    items = [];
    clearTimeout(timer);
    timer = null;
    fn(batchItems);
  };
  return function (item) {
    items.push(item);
    if (items.length >= maxSize) flush();
    else if (!timer) timer = setTimeout(flush, maxWait);
  };
}

// ---------- test helper with a controllable clock ----------
async function tick(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let pass = 0, fail = 0;
const eq = (label, a, b) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) console.log(`      expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  ok ? pass++ : fail++;
};

(async () => {
  // debounce: only last call fires, after wait
  {
    const calls = [];
    const d = debounce((x) => calls.push(x), 50);
    d(1); d(2); d(3);
    eq('debounce: nothing yet', calls, []);
    await tick(80);
    eq('debounce: last only', calls, [3]);
  }

  // debounce leading
  {
    const calls = [];
    const d = debounce((x) => calls.push(x), 50, { leading: true, trailing: false });
    d('a'); d('b');
    eq('debounce leading: first immediately', calls, ['a']);
    await tick(80);
    eq('debounce leading: no trailing', calls, ['a']);
  }

  // debounce cancel / flush
  {
    const calls = [];
    const d = debounce((x) => calls.push(x), 50);
    d(1); d.cancel();
    await tick(80);
    eq('debounce cancel', calls, []);
    d(2); const r = d.flush();
    eq('debounce flush runs now', calls, [2]);
  }

  // debounceAsync: all callers get same result
  {
    let n = 0;
    const d = debounceAsync(async () => ++n, 30);
    const [a, b, c] = await Promise.all([d(), d(), d()]);
    eq('debounceAsync shared result', [a, b, c, n], [1, 1, 1, 1]);
  }

  // throttle: first now, then at most once per window
  {
    const calls = [];
    const t = throttle((x) => calls.push(x), 50);
    t(1);            // leading -> fires
    t(2); t(3);      // within window -> schedule trailing with 3
    eq('throttle: leading fired', calls, [1]);
    await tick(70);
    eq('throttle: trailing fired with last', calls, [1, 3]);
  }

  // once
  {
    let n = 0;
    const o = once(() => ++n);
    eq('once', [o(), o(), o()], [1, 1, 1]);
  }

  // after / before
  {
    const calls = [];
    const a = after(3, () => calls.push('boom'));
    a(); a(); a(); a();
    eq('after(3)', calls, ['boom', 'boom']);
  }

  // batch
  {
    const batches = [];
    const b = batch((items) => batches.push(items), { maxSize: 3, maxWait: 40 });
    b(1); b(2); b(3);           // size flush
    b(4); b(5);
    await tick(60);             // time flush
    eq('batch', batches, [[1, 2, 3], [4, 5]]);
  }

  // rate limiter
  {
    const acquire = createRateLimiter({ tokens: 2, interval: 40 });
    const order = [];
    const run = (id) => acquire().then(() => order.push(id));
    await Promise.all([run(1), run(2)]);
    eq('rateLimiter: first 2 immediate', order, [1, 2]);
    const p = Promise.all([run(3), run(4)]);
    eq('rateLimiter: 3,4 queued', order, [1, 2]);
    await p;
    eq('rateLimiter: 3,4 after refill', order, [1, 2, 3, 4]);
    acquire.stop();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
