# Concurrency & Synchronization

**Critical section** — a piece of code that accesses shared state and must not be run
by more than one thread/goroutine at the same time.

**Race condition** — a bug that happens when the outcome depends on the unpredictable
timing/interleaving of concurrent operations on shared state (e.g. two threads doing
`counter++` at once and losing an update, because `++` is really read → add → write,
and the interleaving can lose one of the writes).

**Mutex (mutual exclusion lock)** — a lock that only one goroutine/thread can hold at a
time, used to protect a critical section. In Go: `sync.Mutex` / `sync.RWMutex`.

**Semaphore** — a counter-based synchronization primitive that allows up to *N*
holders at once (a mutex is a semaphore with N=1). Useful for limiting concurrency
(e.g. "at most 5 workers at a time").

**Deadlock** — a set of goroutines/threads permanently blocked, each waiting on a
resource held by another. Classically requires all four conditions at once:
1. **Mutual exclusion** — resources can't be shared.
2. **Hold and wait** — a holder of one resource waits for another.
3. **No preemption** — a resource can't be forcibly taken away.
4. **Circular wait** — a cycle of goroutines each waiting on the next.

Break any one of these and deadlock can't occur (e.g. always acquire locks in the same
global order to prevent circular wait).

**Go's synchronization toolkit**:
- `sync.Mutex` / `sync.RWMutex` — classic locking.
- `sync.WaitGroup` — wait for a group of goroutines to finish.
- `sync/atomic` — lock-free atomic operations for simple counters.
- **Channels** — Go's idiomatic answer, following the CSP philosophy: *"Don't
  communicate by sharing memory; share memory by communicating."* Instead of locking
  shared state, goroutines pass data through a channel, and the channel itself handles
  the synchronization.

Run examples with the race detector to *see* races get flagged: `go run -race main.go`.

## What `main.go` shows

1. **Demo 1** — an unprotected counter incremented by 1000 goroutines: often prints a
   wrong total, and `-race` flags it.
2. **Demo 2** — the same counter fixed with `sync.Mutex`: always correct.
3. **Demo 3** — the same counter fixed with `sync/atomic` (no lock needed for a simple
   counter).
4. **Demo 4** — a channel-based pattern: goroutines send results into a channel instead
   of writing to shared state.
5. **Demo 5** — a deadlock (two goroutines acquiring two mutexes in opposite order),
   disabled by default so the program doesn't hang — flip `runDeadlock` to `true` in the
   source to watch Go's runtime detect and report it (`fatal error: all goroutines are
   asleep - deadlock!`).
