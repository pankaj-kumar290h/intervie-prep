# Processes & Threads

**Process** — a running instance of a program. The OS gives it its own virtual address
space (code, data, heap, stack), a process ID (PID), and a set of resources (open file
descriptors, etc). Processes are isolated from each other by default.

**Thread** — a unit of execution *within* a process. All threads in a process share the
same address space and file descriptors, but each thread has its own stack, program
counter, and registers. Threads are cheaper to create and switch between than processes
because there's no address-space isolation to set up.

**Process Control Block (PCB)** — the kernel data structure the OS keeps per process:
PID, program counter, register state, memory map, scheduling priority, list of open
files. The OS uses the PCB to save/restore state during a context switch.

**Process states** — a process moves between:

```
New → Ready → Running → (Waiting/Blocked) → Terminated
              ↑______________|
```

- **Ready**: waiting for the scheduler to give it CPU time.
- **Running**: currently executing on a CPU core.
- **Waiting/Blocked**: waiting on I/O or a resource, not eligible for the CPU.

**Threading models** — how user-level threads map to OS (kernel) threads:
- **1:1** — every user thread is a real OS thread (e.g. classic pthreads).
- **M:N** — many user-level threads are multiplexed onto fewer OS threads by a runtime
  scheduler. **This is what Go does**: a goroutine is not an OS thread. The Go runtime's
  scheduler (the "GMP model") multiplexes many goroutines onto a smaller pool of OS
  threads, controlled by `GOMAXPROCS`. That's why you can spawn 100,000 goroutines
  cheaply but not 100,000 OS threads.

**fork/exec** — on Unix, a new *process* is traditionally created with `fork()` (clone
the calling process) followed by `exec()` (replace the clone's memory image with a new
program). Go doesn't expose `fork` directly for running more Go code — that's what
goroutines are for — but the `os/exec` package uses fork+exec under the hood to launch
a genuinely separate OS process (e.g. running a shell command).

## What `main.go` shows

1. Spawns 5 goroutines — they all print the *same* PID (`os.Getpid()`), proving they
   share this one process's memory space, unlike real OS processes.
2. Spawns a real child OS process with `os/exec` — it gets its own PID, demonstrating
   actual process creation (fork+exec) as opposed to lightweight in-process concurrency.
3. Prints `runtime.NumCPU()` and `runtime.GOMAXPROCS(0)` to show the resources Go's
   scheduler has to work with when deciding how many goroutines can truly run in
   parallel (as opposed to merely being interleaved).
