package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"time"
)

func main() {
	fmt.Println("=== IPC & Networking Demo ===")

	fmt.Println("\n--- Demo 1: Pipe (classic OS IPC mechanism) ---")
	pipeDemo()

	fmt.Println("\n--- Demo 2: TCP sockets (client-server networking) ---")
	tcpDemo()
}

func pipeDemo() {
	r, w, err := os.Pipe()
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	go func() {
		defer w.Close()
		fmt.Fprintln(w, "message sent through an OS pipe")
	}()
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		fmt.Println("  received:", scanner.Text())
	}
}

func tcpDemo() {
	// ":0" tells the OS to pick any free port for us.
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	defer listener.Close()
	addr := listener.Addr().String()
	fmt.Printf("  server listening on %s\n", addr)

	go func() {
		conn, err := listener.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		msg, _ := bufio.NewReader(conn).ReadString('\n')
		fmt.Printf("  server received: %s", msg)
		fmt.Fprintf(conn, "echo: %s", msg)
	}()

	time.Sleep(50 * time.Millisecond) // let the server goroutine start accepting
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	defer conn.Close()
	fmt.Fprintln(conn, "hello over TCP")
	reply, _ := bufio.NewReader(conn).ReadString('\n')
	fmt.Printf("  client got reply: %s", reply)
}
