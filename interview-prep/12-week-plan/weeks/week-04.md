# Week 4: Graphs & BFS/DFS

**Time Commitment:** 8-9 hours  
**Focus:** Graph algorithms and design patterns

---

## Learning Objectives

By the end of this week, you should be able to:
- Understand graph representations (adjacency list, matrix)
- Implement BFS and DFS for graphs
- Solve common graph problems
- Understand JavaScript design patterns

---

## Day-by-Day Breakdown

### Day 1: Graph Fundamentals (2 hours)
**Study (1 hour):**
- Read [DSA Graphs section](../../coding/dsa/dsa-interview-questions.md#graphs)
- Understand: directed vs undirected graphs
- Learn: weighted vs unweighted graphs
- Study graph representations:
  - Adjacency List (most common)
  - Adjacency Matrix

**Practice (1 hour):**
- Implement Graph class using adjacency list:
  ```javascript
  class Graph {
    constructor() {
      this.adjacencyList = {};
    }
    
    addVertex(vertex) {
      if (!this.adjacencyList[vertex]) {
        this.adjacencyList[vertex] = [];
      }
    }
    
    addEdge(v1, v2) {
      this.adjacencyList[v1].push(v2);
      this.adjacencyList[v2].push(v1); // For undirected
    }
    
    removeEdge(v1, v2) { }
    removeVertex(vertex) { }
  }
  ```

### Day 2: DFS for Graphs (2 hours)
**Study (30 min):**
- Understand DFS for graphs vs trees
- Learn: visited set to avoid cycles

**Practice (1.5 hours):**
- Implement DFS (recursive and iterative):
  ```javascript
  // Recursive DFS
  function dfs(graph, start, visited = new Set()) {
    visited.add(start);
    console.log(start);
    
    for (const neighbor of graph[start]) {
      if (!visited.has(neighbor)) {
        dfs(graph, neighbor, visited);
      }
    }
  }
  
  // Iterative DFS using stack
  function dfsIterative(graph, start) {
    const stack = [start];
    const visited = new Set();
    // Implement...
  }
  ```
- LeetCode Medium: [Clone Graph](https://leetcode.com/problems/clone-graph/)

### Day 3: BFS for Graphs (2 hours)
**Study (30 min):**
- Understand BFS for graphs
- Learn: shortest path in unweighted graphs

**Practice (1.5 hours):**
- Implement BFS:
  ```javascript
  function bfs(graph, start) {
    const queue = [start];
    const visited = new Set([start]);
    
    while (queue.length > 0) {
      const vertex = queue.shift();
      console.log(vertex);
      
      for (const neighbor of graph[vertex]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  ```
- LeetCode Medium: [Number of Islands](https://leetcode.com/problems/number-of-islands/)

### Day 4: Graph Problems (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Course Schedule](https://leetcode.com/problems/course-schedule/) (Topological Sort)
- LeetCode Medium: [Clone Graph](https://leetcode.com/problems/clone-graph/)
- LeetCode Medium: [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)

### Day 5: Design Patterns (1 hour)
**Study (1 hour):**
- Read [Design Patterns: Observer, Strategy](../../../../design-patterns/javascript/03-behavioral-patterns.md)
- Understand Observer pattern (event emitters)
- Understand Strategy pattern (interchangeable algorithms)
- Review functional programming concepts
- Practice examples:
  ```javascript
  // Observer Pattern
  class EventEmitter {
    constructor() {
      this.events = {};
    }
    
    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }
    
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(listener => listener(data));
      }
    }
  }
  
  // Strategy Pattern
  class PaymentProcessor {
    constructor(strategy) {
      this.strategy = strategy;
    }
    
    process(amount) {
      return this.strategy.pay(amount);
    }
  }
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all graph problems from this week
- Understand when to use BFS vs DFS

**Practice (1.5 hours):**
- Re-solve Number of Islands
- LeetCode Medium: [Word Ladder](https://leetcode.com/problems/word-ladder/)
- Practice explaining graph algorithms clearly

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement BFS and DFS for graphs?
- Can you explain graph representations?
- Can you explain Observer and Strategy patterns?

**Practice:**
- Solve one new graph problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Medium)
1. [Number of Islands](https://leetcode.com/problems/number-of-islands/) - BFS/DFS
2. [Clone Graph](https://leetcode.com/problems/clone-graph/) - DFS with visited map
3. [Course Schedule](https://leetcode.com/problems/course-schedule/) - Topological sort

### Additional Practice
1. [Word Ladder](https://leetcode.com/problems/word-ladder/) - BFS shortest path
2. [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) - Multi-source BFS

---

## Study Materials

### Internal Resources
- [DSA Graphs](../../coding/dsa/dsa-interview-questions.md#graphs)
- [Design Patterns: Behavioral](../../../../design-patterns/javascript/03-behavioral-patterns.md)

### External Resources
- LeetCode Graph Tag: https://leetcode.com/tag/graph/
- NeetCode Graphs: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **BFS for Shortest Path:**
   - Unweighted graphs
   - Level-by-level exploration
   - Use queue

2. **DFS for Exploration:**
   - Finding all paths
   - Cycle detection
   - Use stack (or recursion)

3. **Visited Set:**
   - Always use visited set to avoid cycles
   - Can use Set or boolean array

4. **Topological Sort:**
   - DAG (Directed Acyclic Graph)
   - Dependency resolution
   - Use DFS or Kahn's algorithm

---

## Tips

- **Choose representation:** Adjacency list is usually better (space efficient)
- **Handle cycles:** Always track visited nodes
- **Visualize:** Draw graphs to understand structure
- **Practice both:** Know both BFS and DFS implementations

---

## Weekly Checklist

- [ ] Implemented Graph class from scratch
- [ ] Can implement BFS and DFS for graphs
- [ ] Solved at least 4-5 graph problems
- [ ] Reviewed Observer and Strategy patterns
- [ ] Can explain graph algorithms clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Milestone: End of Foundation Phase

Congratulations! You've completed the foundation phase (Weeks 1-4). You should now be comfortable with:
- Arrays, hash tables, linked lists
- Trees and graphs
- Basic algorithms (BFS, DFS)
- Core JavaScript concepts

**Next:** Weeks 5-8 will focus on intermediate DSA and backend introduction.
