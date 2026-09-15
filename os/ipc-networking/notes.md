# IPC & Networking

**IPC (Inter-Process Communication)** — mechanisms that let separate processes (which
don't share memory, unlike threads) exchange data:
- **Pipes** — a unidirectional byte stream between two file descriptors, usually
  parent↔child (e.g. shell `|`). `os.Pipe()` gives you a raw OS pipe in Go.
- **Shared memory** — a region of physical memory mapped into multiple processes'
  address spaces; fastest IPC but needs manual synchronization.
- **Message queues** — the OS (or a broker) buffers discrete messages between
  processes.
- **Signals** — async notifications (e.g. `SIGTERM`) — not for bulk data, just events.
- **Sockets** — a bidirectional, addressable endpoint; works between processes on the
  same machine (Unix domain sockets) or across a network (TCP/UDP over IP).

**Sockets as an OS abstraction** — a socket is a file descriptor the kernel binds to a
network endpoint (IP + port for TCP/UDP). The OS handles the actual packet
transmission, retransmission (for TCP), and buffering; your program just reads/writes
the file descriptor.

**TCP vs UDP**:
- **TCP** — connection-oriented, reliable, ordered, handles retransmission and flow
  control. Higher overhead (handshake, acks). Used when correctness matters more than
  latency (HTTP, most APIs).
- **UDP** — connectionless, "fire and forget", no ordering/reliability guarantees, much
  lower overhead. Used when speed matters more than guaranteed delivery (DNS, video
  streaming, gaming).

**Client-server model** — a server calls `listen`+`accept` on a socket bound to a known
port; a client calls `connect` to that address; once connected, both sides read/write
the same duplex byte stream (for TCP).

## What `main.go` shows

1. **Demo 1** — `os.Pipe()`: one goroutine writes a message into the write-end of an OS
   pipe, another reads it from the read-end — the same primitive processes use to
   communicate (e.g. a shell pipeline).
2. **Demo 2** — a minimal TCP client-server: a goroutine listens on `127.0.0.1:0` (OS
   picks a free port), a client dials it, sends a message, and the server echoes it
   back — showing the full socket lifecycle (`Listen` → `Accept` → `Dial` → read/write)
   in one process for clarity, even though in real life the two sides are usually
   separate processes/machines.
