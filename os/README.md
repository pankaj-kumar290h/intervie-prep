# OS Concepts (with Go examples)

Each subfolder pairs a short concept write-up (`notes.md`) with a runnable Go program
(`main.go`) that demonstrates it directly — Go is a good fit here because goroutines,
channels, and the `os`/`net` packages map closely onto real OS concepts (threads,
scheduling, sockets, pipes) without much abstraction in the way.

| Folder | Concepts covered |
| --- | --- |
| [processes-threads/](processes-threads/notes.md) | Process vs thread, PCB, process states, goroutines vs OS processes (`os/exec`) |
| [concurrency-sync/](concurrency-sync/notes.md) | Race conditions, mutexes, semaphores, deadlock conditions, channels |
| [scheduling-memory/](scheduling-memory/notes.md) | CPU scheduling (Round Robin simulation), Go's GMP scheduler, stack vs heap |
| [ipc-networking/](ipc-networking/notes.md) | IPC (pipes), sockets, TCP client-server |

**Suggested order:** Processes & Threads → Concurrency & Synchronization → Scheduling &
Memory Management → IPC & Networking.

## Running an example

Go is already installed on this machine at `/usr/local/go/bin`, but that directory
isn't on your shell's `PATH` by default, so plain `go version` will say "command not
found". Fix it once by adding this to `~/.zshrc`, then open a new terminal:

```bash
echo 'export PATH="/usr/local/go/bin:$PATH"' >> ~/.zshrc
```

Then from the `os/` folder:

```bash
go run ./processes-threads
go run ./concurrency-sync
go run -race ./concurrency-sync   # flags the race condition in Demo 1
go run ./scheduling-memory
go run ./ipc-networking
```

Each `main.go` prints its own commentary as it runs, so read the notes.md for the
concept first, then run the code and match the output back to the explanation.
