package main

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"sync"
	"time"
)

func main() {
	fmt.Println("=== Process & Thread Demo ===")
	fmt.Printf("Current process PID: %d\n", os.Getpid())
	fmt.Printf("Logical CPUs available: %d\n", runtime.NumCPU())
	fmt.Printf("GOMAXPROCS (OS threads Go's scheduler uses for parallel work): %d\n\n", runtime.GOMAXPROCS(0))

	fmt.Println("--- Demo 1: Goroutines (lightweight, share this process's memory) ---")
	fmt.Printf("Goroutines before spawn: %d\n", runtime.NumGoroutine())

	var wg sync.WaitGroup
	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			time.Sleep(100 * time.Millisecond)
			fmt.Printf("  goroutine %d running inside PID %d\n", id, os.Getpid())
		}(i)
	}
	fmt.Printf("Goroutines right after spawn (before they finish): %d\n", runtime.NumGoroutine())
	wg.Wait()

	fmt.Println("\n--- Demo 2: Real OS child process (fork+exec under the hood) ---")
	cmd := exec.Command("echo", "hello from a brand-new OS process")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Printf("Parent PID: %d | child output: %s", os.Getpid(), out)

	fmt.Println("\nTakeaway: the 5 goroutines above all ran INSIDE this one OS process/PID,")
	fmt.Println("sharing its memory. The child process from Demo 2 got its own PID and its own")
	fmt.Println("isolated memory space — that's the real difference between a thread and a process.")
}
