# Scheduling & Memory Management

## CPU scheduling

The scheduler decides which ready process/thread gets the CPU next. Common algorithms:

- **FCFS (First-Come-First-Served)** — run in arrival order, no preemption. Simple but
  can cause the "convoy effect" (short jobs stuck behind a long one).
- **SJF (Shortest Job First)** — run the shortest job next. Minimizes average waiting
  time but needs to know burst times in advance.
- **Round Robin** — each process gets a fixed time slice (**quantum**); if it doesn't
  finish, it goes to the back of the queue. Fair, good for interactive systems, but
  throughput depends heavily on choosing a good quantum.
- **Priority scheduling** — highest priority ready process runs next; risks
  **starvation** of low-priority processes without aging.

Key metrics: **waiting time** (time spent ready but not running), **turnaround time**
(total time from arrival to completion), **response time** (time to first run).

## Go's own scheduler (the "GMP model")

Go doesn't rely on the OS to schedule every goroutine — it has its own user-space
scheduler:
- **G** — a goroutine.
- **M** — a Machine, i.e. an OS thread.
- **P** — a Processor context: holds a run queue of Gs and is required for an M to
  execute Go code. The number of Ps is `GOMAXPROCS` (defaults to `NumCPU()`).

Many Gs are multiplexed onto few Ms via Ps — an M:N model. Since Go 1.14 the scheduler
can even preempt a long-running goroutine asynchronously (via signals), not just at
function calls, so a tight loop with no I/O won't starve other goroutines forever.

## Memory management

- **Stack** — each goroutine gets its own small stack (starts at ~2KB) that grows/
  shrinks automatically. Fast to allocate on, freed automatically when the function
  returns.
- **Heap** — memory that outlives a single function call; managed by Go's garbage
  collector.
- **Escape analysis** — the compiler decides at compile time whether a value can stay
  on the stack or must "escape" to the heap (e.g. because a pointer to it is returned
  or stored somewhere long-lived). See it yourself: `go build -gcflags='-m' main.go`.
- **Virtual memory / paging** (OS-level, not Go-specific) — each process sees its own
  contiguous virtual address space; the OS's page tables map virtual pages to physical
  RAM frames (or swap), giving isolation and letting the OS overcommit memory.

## What `main.go` shows

1. **Demo 1** — a hand-rolled **Round Robin** scheduling simulation over 4 fake
   processes with different burst times, printing a Gantt chart and computing average
   waiting/turnaround time — the classic OS-course exercise, implemented directly.
2. **Demo 2** — prints `GOMAXPROCS`, `NumCPU`, and the live goroutine count, tying back
   to Go's own GMP scheduler.
3. **Demo 3** — allocates a large slice and reads `runtime.MemStats` before/after to see
   heap growth, with a pointer to `-gcflags='-m'` for escape analysis.
