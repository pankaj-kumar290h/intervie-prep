# JavaScript Interview Prep — topic-wise question bank

Questions in the style asked at top product companies (Google, Meta, Amazon, Microsoft,
Uber, Atlassian, Adobe, Flipkart, Razorpay, Swiggy, Zomato, PhonePe, CRED, Walmart,
Booking, Airbnb).

| Folder | Topic | Rounds it shows up in |
|---|---|---|
| `promise/` | Promises, `Promise.all` family, async utilities | Machine coding, DSA-lite |
| `closures/` | Closures, IIFE, module pattern, private state | Screening, output prediction |
| `this-keyword/` | `this` binding, `call`/`apply`/`bind` | Screening, output prediction |
| `prototypes-inheritance/` | Prototype chain, `class`, inheritance, `new` | Machine coding, discussion |
| `event-loop/` | Microtasks vs macrotasks, task ordering | Output prediction |
| `async-await/` | `async`/`await` semantics, error handling, parallelism | Output prediction, machine coding |
| `polyfills/` | `map`/`filter`/`reduce`/`bind`/`call`/`flat`/`Object.assign` | Machine coding |
| `debounce-throttle/` | `debounce`, `throttle`, `once`, rate limiting | Machine coding |
| `currying-composition/` | Currying, partial application, `pipe`/`compose` | Machine coding |
| `objects-cloning/` | Deep clone, deep equal, deep freeze, immutability | Machine coding |
| `hoisting-scope/` | `var`/`let`/`const`, TDZ, hoisting, block scope | Output prediction |
| `arrays-strings/` | Array/string transforms, grouping, flattening | DSA-lite, machine coding |
| `output-prediction/` | Mixed "what does this log" rapid-fire | Screening |
| `machine-coding/` | Bigger builds: EventEmitter, LRU, JSON.stringify, etc. | 60–90 min machine coding |

Every folder has:
- `QUESTIONS.md` — the questions, ordered easy → hard, with the exact follow-ups interviewers ask
- `practice.js` — a scratch file (stubs + a tiny test harness, or runnable snippets for the
  output-prediction folders). Run with `node practice.js`.

Folders with worked, self-checking reference solutions (`node SOLUTIONS.js` → all green):
`promise/`, `polyfills/`, `debounce-throttle/`, `currying-composition/`, `objects-cloning/`,
`machine-coding/`. The `output-prediction/` folder has `SOLUTIONS.md` (answers + reasons).
For the rest, implement in `practice.js` and reason from the "Must be able to state" section
at the bottom of each `QUESTIONS.md`.

## How to use this

1. Pick a folder, read `QUESTIONS.md` top to bottom first — don't code yet.
2. For output-prediction questions: write your answer down, then run it.
3. For machine-coding questions: implement in `practice.js`, uncomment tests as you go.
4. Check against `SOLUTIONS.js` only after a real attempt. Diff your approach, not just the result.
5. Be able to *say out loud* the "why" — interviewers probe reasoning, not syntax.

## Suggested 2-week plan

- Day 1–2: `closures`, `this-keyword`, `hoisting-scope`
- Day 3–4: `event-loop`, `async-await`, `promise`
- Day 5–6: `polyfills`, `debounce-throttle`
- Day 7: `output-prediction` (timed, mixed)
- Day 8–9: `prototypes-inheritance`, `currying-composition`
- Day 10–11: `objects-cloning`, `arrays-strings`
- Day 12–14: `machine-coding` (full 60–90 min mocks)
