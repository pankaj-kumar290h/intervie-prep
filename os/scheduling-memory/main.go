package main

import (
	"fmt"
	"runtime"
)

type process struct {
	id         string
	burstTime  int
	remaining  int
	waiting    int
	turnaround int
}

func main() {
	fmt.Println("=== Scheduling & Memory Demo ===")

	fmt.Println("\n--- Demo 1: Round Robin CPU scheduling simulation (quantum = 2) ---")
	roundRobin(2)

	fmt.Println("\n--- Demo 2: Go's own scheduler knobs (the GMP model) ---")
	fmt.Printf("GOMAXPROCS (max OS threads running Go code in parallel): %d\n", runtime.GOMAXPROCS(0))
	fmt.Printf("NumCPU: %d, goroutines right now: %d\n", runtime.NumCPU(), runtime.NumGoroutine())

	fmt.Println("\n--- Demo 3: Stack vs heap (memory management) ---")
	memoryDemo()
}

// roundRobin simulates Round Robin CPU scheduling over a fixed set of processes,
// printing a Gantt chart and the resulting waiting/turnaround times.
func roundRobin(quantum int) {
	processes := []*process{
		{id: "P1", burstTime: 5},
		{id: "P2", burstTime: 3},
		{id: "P3", burstTime: 8},
		{id: "P4", burstTime: 6},
	}
	for _, p := range processes {
		p.remaining = p.burstTime
	}

	clock := 0
	queue := append([]*process{}, processes...)

	fmt.Println("Gantt chart:")
	for len(queue) > 0 {
		p := queue[0]
		queue = queue[1:]

		run := quantum
		if p.remaining < quantum {
			run = p.remaining
		}
		fmt.Printf("  [%s runs %d..%d]\n", p.id, clock, clock+run)
		clock += run
		p.remaining -= run

		if p.remaining > 0 {
			queue = append(queue, p)
		} else {
			p.turnaround = clock
			p.waiting = p.turnaround - p.burstTime
		}
	}

	totalWait, totalTurn := 0, 0
	for _, p := range processes {
		fmt.Printf("  %s: turnaround=%d waiting=%d\n", p.id, p.turnaround, p.waiting)
		totalWait += p.waiting
		totalTurn += p.turnaround
	}
	n := len(processes)
	fmt.Printf("Average waiting time: %.2f, average turnaround time: %.2f\n",
		float64(totalWait)/float64(n), float64(totalTurn)/float64(n))
}

func memoryDemo() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	fmt.Printf("Heap allocated before: %d KB\n", m.HeapAlloc/1024)

	// A slice big enough that escape analysis puts it on the heap.
	data := make([]int, 1_000_000)
	for i := range data {
		data[i] = i
	}

	runtime.ReadMemStats(&m)
	fmt.Printf("Heap allocated after allocating 1M ints: %d KB\n", m.HeapAlloc/1024)
	fmt.Println("Run `go build -gcflags='-m' main.go` to see the compiler's escape analysis decisions.")
}
