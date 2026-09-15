package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	fmt.Println("=== Concurrency & Synchronization Demo ===")

	fmt.Println("\n--- Demo 1: Race condition (run with `go run -race .` to see it flagged) ---")
	unsafeCounter := 0
	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			unsafeCounter++ // NOT safe: read-modify-write with no synchronization
		}()
	}
	wg.Wait()
	fmt.Printf("Expected 1000, got %d (often wrong because of the race)\n", unsafeCounter)

	fmt.Println("\n--- Demo 2: Fixed with sync.Mutex (mutual exclusion) ---")
	var mu sync.Mutex
	safeCounter := 0
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			safeCounter++
			mu.Unlock()
		}()
	}
	wg.Wait()
	fmt.Printf("Expected 1000, got %d (always correct)\n", safeCounter)

	fmt.Println("\n--- Demo 3: Fixed with sync/atomic (lock-free) ---")
	var atomicCounter int64
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			atomic.AddInt64(&atomicCounter, 1)
		}()
	}
	wg.Wait()
	fmt.Printf("Expected 1000, got %d\n", atomicCounter)

	fmt.Println("\n--- Demo 4: Channels (CSP — synchronize by communicating, not locking) ---")
	results := make(chan int, 5)
	for i := 1; i <= 5; i++ {
		go func(id int) {
			results <- id * id
		}(i)
	}
	sum := 0
	for i := 0; i < 5; i++ {
		sum += <-results
	}
	fmt.Printf("Sum of squares 1..5 computed concurrently via channel: %d\n", sum)

	fmt.Println("\n--- Demo 5: Deadlock (circular wait) — disabled by default ---")
	fmt.Println("Set runDeadlock := true below to watch Go's runtime detect and report it.")
	runDeadlock := false
	if runDeadlock {
		deadlockDemo()
	}
}

// deadlockDemo triggers a classic AB-BA deadlock: one goroutine locks A then B,
// while main locks B then A. A WaitGroup barrier forces both sides to hold their
// first lock before either attempts the second, guaranteeing the circular wait
// (without it, one side could race ahead and finish before the other even starts).
func deadlockDemo() {
	var muA, muB sync.Mutex
	var barrier sync.WaitGroup
	barrier.Add(2)

	go func() {
		muA.Lock()
		barrier.Done()
		barrier.Wait()
		muB.Lock() // blocks forever: main is holding muB
		muB.Unlock()
		muA.Unlock()
	}()

	muB.Lock()
	barrier.Done()
	barrier.Wait()
	muA.Lock() // blocks forever: the goroutine above is holding muA -> deadlock
	muA.Unlock()
	muB.Unlock()
}
