# Graph Interview Questions — Easy → Very Very Hard

20 curated graph problems with problem statements, intuition, JavaScript solutions, and
complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Number of Islands](#1-number-of-islands)
2. [Flood Fill](#2-flood-fill)
3. [Find if Path Exists in Graph](#3-find-if-path-exists-in-graph)
4. [Max Area of Island](#4-max-area-of-island)
5. [Clone Graph](#5-clone-graph)

**Medium**
6. [Course Schedule](#6-course-schedule)
7. [Course Schedule II](#7-course-schedule-ii)
8. [Rotting Oranges](#8-rotting-oranges)
9. [Pacific Atlantic Water Flow](#9-pacific-atlantic-water-flow)
10. [Graph Valid Tree](#10-graph-valid-tree)
11. [Number of Connected Components in an Undirected Graph](#11-number-of-connected-components-in-an-undirected-graph)
12. [Word Ladder](#12-word-ladder)
13. [Redundant Connection](#13-redundant-connection)

**Hard**
14. [Network Delay Time](#14-network-delay-time)
15. [Cheapest Flights Within K Stops](#15-cheapest-flights-within-k-stops)
16. [Alien Dictionary](#16-alien-dictionary)
17. [Reconstruct Itinerary](#17-reconstruct-itinerary)

**Very Hard**
18. [Minimum Spanning Tree via Kruskal's Algorithm](#18-minimum-spanning-tree-via-kruskals-algorithm)
19. [Swim in Rising Water](#19-swim-in-rising-water)

**Very Very Hard**
20. [Dijkstra + Union-Find + Tarjan's Bridges](#20-the-boss-fight)

---

## Easy

### 1. Number of Islands

**Problem.** Given a 2D grid of `'1'` (land) and `'0'` (water), return the number of
islands. An island is formed by connecting adjacent lands horizontally or vertically.

**Intuition.** Scan every cell. When an unvisited `'1'` is found, it's a new island — flood
fill it with DFS, sinking every connected land cell to `'0'` so it's never counted again.

```javascript
function numIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // sink so we never revisit
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}
```

**Complexity.** Time O(rows · cols), Space O(rows · cols) worst case for the recursion
stack (a fully-land grid).

---

### 2. Flood Fill

**Problem.** Given an image (2D grid of ints), a starting pixel `(sr, sc)`, and a new
`color`, repaint the starting pixel's connected component (same original color,
4-directionally connected) with `color`.

**Intuition.** Classic DFS from the start pixel, only recursing into neighbors that still
match the *original* color. Guard against `color === startColor` to avoid infinite
recursion when the fill color equals the existing one.

```javascript
function floodFill(image, sr, sc, color) {
  const rows = image.length;
  const cols = image[0].length;
  const startColor = image[sr][sc];
  if (startColor === color) return image;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] !== startColor) return;
    image[r][c] = color;
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  dfs(sr, sc);
  return image;
}
```

**Complexity.** Time O(rows · cols), Space O(rows · cols) recursion stack worst case.

---

### 3. Find if Path Exists in Graph

**Problem.** Given `n` nodes labeled `0..n-1`, an edge list of undirected edges
`[[a, b], ...]`, and `source`/`destination`, return whether a path exists between them.

**Intuition.** Build an adjacency list from the edges, then run a plain BFS (or DFS) from
`source`, tracking visited nodes, and check if `destination` is ever reached.

```javascript
function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const visited = new Array(n).fill(false);
  const queue = [source];
  visited[source] = true;

  while (queue.length) {
    const node = queue.shift();
    if (node === destination) return true;
    for (const next of adj[node]) {
      if (!visited[next]) {
        visited[next] = true;
        queue.push(next);
      }
    }
  }
  return false;
}
```

**Complexity.** Time O(V + E), Space O(V + E).

---

### 4. Max Area of Island

**Problem.** Given a grid of `0`s and `1`s, return the area of the largest island (`1`s
connected 4-directionally), or `0` if there is none.

**Intuition.** Same flood fill as Number of Islands, but the DFS returns the count of cells
it sank instead of just marking them, so each island's area can be compared against the
running best.

```javascript
function maxAreaOfIsland(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let best = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return 0;
    grid[r][c] = 0;
    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) best = Math.max(best, dfs(r, c));
    }
  }
  return best;
}
```

**Complexity.** Time O(rows · cols), Space O(rows · cols) recursion stack worst case.

---

### 5. Clone Graph

**Problem.** Given a reference to a node in a connected undirected graph (each node has a
`val` and a `neighbors` array), return a deep copy of the entire graph.

**Intuition.** DFS from the given node, using a `Map` from original node → clone to avoid
re-cloning a node (and to stop infinite recursion on cycles). Before recursing into a
node's neighbors, register its clone in the map so any cycle back to it is resolved
immediately.

```javascript
function cloneGraph(node) {
  if (!node) return null;
  const visited = new Map();

  function dfs(n) {
    if (visited.has(n)) return visited.get(n);
    const clone = { val: n.val, neighbors: [] };
    visited.set(n, clone);
    for (const neighbor of n.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }
    return clone;
  }

  return dfs(node);
}
```

**Complexity.** Time O(V + E), Space O(V) for the map plus recursion stack.

---

## Medium

### 6. Course Schedule

**Problem.** There are `numCourses` courses `0..numCourses-1`. `prerequisites[i] = [a, b]`
means to take course `a` you must first take course `b` (a directed edge `b -> a`). Return
whether it's possible to finish all courses (i.e., the prerequisite graph has no cycle).

**Intuition.** This is cycle detection in a directed graph, solved with Kahn's algorithm:
repeatedly remove nodes with in-degree 0. If every node gets removed, there's no cycle; if
some remain stuck (all with in-degree > 0, forming a cycle), it's impossible.

```javascript
function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indeg[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);

  let taken = 0;
  while (queue.length) {
    const node = queue.shift();
    taken++;
    for (const next of adj[node]) {
      if (--indeg[next] === 0) queue.push(next);
    }
  }
  return taken === numCourses;
}
```

**Complexity.** Time O(V + E), Space O(V + E). (DFS with a 3-color visited state — white/
gray/black — is an equally valid alternative.)

---

### 7. Course Schedule II

**Problem.** Same setup as Course Schedule, but return *a* valid order to take all courses,
or `[]` if impossible.

**Intuition.** Identical Kahn's algorithm, except we record the pop order — that's a valid
topological sort. If we can't process every course, a cycle exists and no order works.

```javascript
function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indeg[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of adj[node]) {
      if (--indeg[next] === 0) queue.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}
```

**Complexity.** Time O(V + E), Space O(V + E).

---

### 8. Rotting Oranges

**Problem.** A grid has `0` (empty), `1` (fresh orange), `2` (rotten orange). Every minute,
a rotten orange rots its fresh 4-directional neighbors. Return the minimum minutes until no
cell is fresh, or `-1` if impossible.

**Intuition.** Multi-source BFS: seed the queue with every initially rotten orange
simultaneously, then expand level by level (each level = one minute), decrementing a
`fresh` counter as oranges rot.

```javascript
function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  let queue = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}
```

**Complexity.** Time O(rows · cols), Space O(rows · cols) for the queue.

---

### 9. Pacific Atlantic Water Flow

**Problem.** Given a grid of heights, water can flow from a cell to a 4-directional
neighbor with height ≤ its own. The Pacific touches the top and left edges, the Atlantic
the bottom and right edges. Return all cells from which water can reach *both* oceans.

**Intuition.** Reverse the flow: BFS/DFS *outward* from every Pacific-border cell (moving
to a neighbor whenever its height ≥ current, since that's a valid downhill step in the
original direction), separately for the Atlantic. A cell reachable from both border sets
can drain to both oceans.

```javascript
function pacificAtlantic(heights) {
  const rows = heights.length;
  const cols = heights[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function bfs(starts) {
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const queue = [...starts];
    for (const [r, c] of starts) visited[r][c] = true;

    while (queue.length) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !visited[nr][nc] && heights[nr][nc] >= heights[r][c]
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return visited;
  }

  const pacificStarts = [];
  const atlanticStarts = [];
  for (let r = 0; r < rows; r++) {
    pacificStarts.push([r, 0]);
    atlanticStarts.push([r, cols - 1]);
  }
  for (let c = 0; c < cols; c++) {
    pacificStarts.push([0, c]);
    atlanticStarts.push([rows - 1, c]);
  }

  const pacific = bfs(pacificStarts);
  const atlantic = bfs(atlanticStarts);

  const res = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacific[r][c] && atlantic[r][c]) res.push([r, c]);
    }
  }
  return res;
}
```

**Complexity.** Time O(rows · cols), Space O(rows · cols).

---

### 10. Graph Valid Tree

**Problem.** Given `n` nodes labeled `0..n-1` and a list of undirected edges, return
whether they form a valid tree (connected, and no cycles).

**Intuition.** A graph with `n` nodes is a tree iff it has exactly `n - 1` edges *and* is
fully connected. Check the edge count first (cheap), then run a single DFS/BFS from node 0
and verify every node was reached.

```javascript
function validTree(n, edges) {
  if (edges.length !== n - 1) return false; // too few or too many edges

  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const visited = new Array(n).fill(false);
  const stack = [0];
  visited[0] = true;
  let count = 1;

  while (stack.length) {
    const node = stack.pop();
    for (const next of adj[node]) {
      if (!visited[next]) {
        visited[next] = true;
        count++;
        stack.push(next);
      }
    }
  }
  return count === n;
}
```

**Complexity.** Time O(V + E), Space O(V + E).

---

### 11. Number of Connected Components in an Undirected Graph

**Problem.** Given `n` nodes labeled `0..n-1` and an undirected edge list, return the
number of connected components.

**Intuition.** Union-Find: start with `n` components, and every time an edge joins two
nodes with different roots, merge them and decrement the component count.

```javascript
function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression
      x = parent[x];
    }
    return x;
  }

  let components = n;
  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      components--;
    }
  }
  return components;
}
```

**Complexity.** Time O(E · α(V)) ≈ O(E), Space O(V). (Plain DFS/BFS over the adjacency
list also works in O(V + E).)

---

### 12. Word Ladder

**Problem.** Given `beginWord`, `endWord`, and a `wordList`, return the length of the
shortest transformation sequence from `beginWord` to `endWord`, changing one letter at a
time, where every intermediate word must exist in `wordList`. Return `0` if no such
sequence exists.

**Intuition.** Model each word as a graph node with an edge to every word one letter away.
BFS from `beginWord` finds the shortest path in this implicit graph. Instead of building
the whole graph, generate all 25 single-letter variants of each word on the fly and check
membership in a `Set`.

```javascript
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  let queue = [beginWord];
  wordSet.delete(beginWord);
  let steps = 1;

  while (queue.length) {
    const next = [];
    for (const word of queue) {
      if (word === endWord) return steps;
      for (let i = 0; i < word.length; i++) {
        for (let code = 97; code <= 122; code++) {
          const ch = String.fromCharCode(code);
          if (ch === word[i]) continue;
          const candidate = word.slice(0, i) + ch + word.slice(i + 1);
          if (wordSet.has(candidate)) {
            wordSet.delete(candidate);
            next.push(candidate);
          }
        }
      }
    }
    queue = next;
    steps++;
  }
  return 0;
}
```

**Complexity.** Time O(N · L² ) where `N` is `wordList` size and `L` is word length
(each word generates `L · 26` candidates, each a string op), Space O(N · L).

---

### 13. Redundant Connection

**Problem.** A tree with `n` nodes had one extra edge added, creating exactly one cycle.
Given the edge list (as added, 1-indexed), return the edge that can be removed to restore
a tree. If multiple answers exist, return the one that appears last in the input.

**Intuition.** Process edges in order with Union-Find. The first edge whose two endpoints
are *already* in the same component is the redundant one — it's the one closing the cycle.

```javascript
function findRedundantConnection(edges) {
  const n = edges.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  for (const [a, b] of edges) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return [a, b];
    parent[ra] = rb;
  }
  return [];
}
```

**Complexity.** Time O(n · α(n)) ≈ O(n), Space O(n).

---

## Hard

### 14. Network Delay Time

**Problem.** `n` nodes labeled `1..n`. `times[i] = [u, v, w]` is a directed edge `u -> v`
with weight `w`. A signal starts at node `k`. Return the time for the signal to reach every
node, or `-1` if some node is unreachable.

**Intuition.** Single-source shortest paths with non-negative weights — textbook Dijkstra.
A naive O(V²) scan-for-minimum works fine for small graphs, but a binary min-heap gets it
to O((V + E) log V), which matters once the graph is large or dense.

```javascript
class MinHeap {
  constructor() {
    this.heap = []; // each item: [priority, ...payload]
  }
  size() {
    return this.heap.length;
  }
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  _bubbleDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;

  const heap = new MinHeap();
  heap.push([0, k]);

  while (heap.size()) {
    const [d, node] = heap.pop();
    if (d > dist[node]) continue; // stale entry
    for (const [next, w] of adj[node]) {
      const nd = d + w;
      if (nd < dist[next]) {
        dist[next] = nd;
        heap.push([nd, next]);
      }
    }
  }

  let maxDist = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    maxDist = Math.max(maxDist, dist[i]);
  }
  return maxDist;
}
```

**Complexity.** Time O((V + E) log V) with the binary heap, Space O(V + E). (Naive
O(V²) Dijkstra without a heap is simpler to write and fine for dense small graphs.)

---

### 15. Cheapest Flights Within K Stops

**Problem.** `n` cities, `flights[i] = [from, to, price]` (directed). Find the cheapest
price from `src` to `dst` using at most `k` stops (i.e., at most `k + 1` edges). Return
`-1` if unreachable within that limit.

**Intuition.** Dijkstra doesn't respect the "at most K edges" constraint directly, so use
Bellman-Ford limited to exactly `k + 1` relaxation rounds. Crucially, relax from a snapshot
of the previous round's distances (not the array being updated in place), otherwise a
single round could chain multiple edges together and violate the stop limit.

```javascript
function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let round = 0; round <= k; round++) {
    const newDist = dist.slice();
    for (const [u, v, w] of flights) {
      if (dist[u] !== Infinity && dist[u] + w < newDist[v]) {
        newDist[v] = dist[u] + w;
      }
    }
    dist = newDist;
  }

  return dist[dst] === Infinity ? -1 : dist[dst];
}
```

**Complexity.** Time O(K · E), Space O(V).

---

### 16. Alien Dictionary

**Problem.** Given a list of words sorted lexicographically by an unknown alien alphabet,
derive a valid ordering of that alphabet's letters. Return `""` if no valid ordering
exists (contradictory or invalid input, e.g. a longer word appearing before its own
prefix).

**Intuition.** Compare each pair of adjacent words to find the first differing letter —
that gives a directed edge `earlier -> later` in the alphabet. Also, if `words[i]` is
longer than `words[i+1]` but `words[i+1]` is a prefix of it, the input is invalid (a
shorter valid prefix can't come after its own extension). Once the edges are built,
topologically sort the letters via DFS, detecting cycles with a 3-state visited map.

```javascript
function alienOrder(words) {
  const adj = new Map();
  for (const w of words) {
    for (const ch of w) if (!adj.has(ch)) adj.set(ch, new Set());
  }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);
    if (w1.length > w2.length && w1.slice(0, minLen) === w2.slice(0, minLen)) return "";

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        adj.get(w1[j]).add(w2[j]);
        break;
      }
    }
  }

  const visited = new Map(); // char -> 0 (in progress) | 1 (done)
  const result = [];
  let hasCycle = false;

  function dfs(ch) {
    if (hasCycle) return;
    visited.set(ch, 0);
    for (const next of adj.get(ch)) {
      if (visited.get(next) === 0) {
        hasCycle = true;
        return;
      }
      if (!visited.has(next)) dfs(next);
    }
    visited.set(ch, 1);
    result.push(ch);
  }

  for (const ch of adj.keys()) {
    if (!visited.has(ch)) dfs(ch);
    if (hasCycle) return "";
  }

  return result.reverse().join("");
}
```

**Complexity.** Time O(C) where `C` is the total number of characters across all words
(building edges) plus O(V + E) for the DFS over the (small, ≤26-letter) alphabet graph.
Space O(V + E).

---

### 17. Reconstruct Itinerary

**Problem.** Given a list of airline tickets `[from, to]` (directed edges), reconstruct
the itinerary starting from `"JFK"` that uses every ticket exactly once. If multiple valid
itineraries exist, return the lexicographically smallest one.

**Intuition.** This is finding an Eulerian path — a path using every edge exactly once.
Sort each node's destinations lexicographically, then run Hierholzer's algorithm: greedily
DFS, always consuming the smallest available edge; when stuck (no more outgoing edges),
append the current node to the route. Because we only get stuck at a "dead end," this
naturally produces the route in reverse post-order — reverse it at the end.

```javascript
function findItinerary(tickets) {
  const adj = new Map();
  const sorted = [...tickets].sort((a, b) => (a[1] < b[1] ? -1 : 1));
  for (const [from, to] of sorted) {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push(to);
  }

  const route = [];
  function visit(airport) {
    const destinations = adj.get(airport);
    while (destinations && destinations.length) {
      const next = destinations.shift(); // always take the smallest remaining
      visit(next);
    }
    route.push(airport);
  }

  visit("JFK");
  return route.reverse();
}
```

**Complexity.** Time O(E log E) for the sort (or O(E) with a pre-sorted multiset per node),
plus O(E) for the traversal, Space O(V + E). (`shift()` on an array is O(E) per call in the
worst case; a real deque/linked-list per node makes the traversal itself O(E).)

---

## Very Hard

### 18. Minimum Spanning Tree via Kruskal's Algorithm

**Problem.** Given `n` nodes and a weighted undirected edge list `[u, v, weight]`, find a
minimum spanning tree: a subset of `n - 1` edges connecting all nodes with the minimum
total weight.

**Intuition.** Greedily consider edges in increasing weight order. Add an edge if and only
if it connects two currently-separate components (checked and merged via Union-Find) —
adding an edge within the same component would create a cycle and can never help.

```javascript
function minimumSpanningTree(n, edges) {
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  let totalWeight = 0;
  const mstEdges = [];

  for (const [u, v, w] of sorted) {
    const ru = find(u);
    const rv = find(v);
    if (ru !== rv) {
      parent[ru] = rv;
      totalWeight += w;
      mstEdges.push([u, v, w]);
      if (mstEdges.length === n - 1) break;
    }
  }
  return { totalWeight, mstEdges };
}
```

**Complexity.** Time O(E log E) for the sort (dominates), Space O(V + E). (Prim's
algorithm with a min-heap is the usual alternative, better on dense graphs: O(E log V).)

---

### 19. Swim in Rising Water

**Problem.** An `n x n` grid where `grid[r][c]` is the elevation at that cell. At time `t`,
you may move between 4-directionally adjacent cells only if both have elevation ≤ `t`.
Starting at `(0, 0)`, return the minimum `t` at which `(n-1, n-1)` is reachable.

**Intuition.** The answer is monotonic in `t`: if you can reach the destination at time `t`,
you can also reach it at any `t' > t`. That monotonicity lets us binary search on `t`,
using a BFS/DFS reachability check (only stepping onto cells with elevation ≤ `t`) as the
predicate. (A Dijkstra-style "minimize the maximum edge weight on the path" approach —
always expanding the currently lowest-elevation frontier cell via a min-heap — solves it
in one pass without the binary search.)

```javascript
function swimInWater(grid) {
  const n = grid.length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function canReach(t) {
    if (grid[0][0] > t) return false;
    const visited = Array.from({ length: n }, () => new Array(n).fill(false));
    const stack = [[0, 0]];
    visited[0][0] = true;

    while (stack.length) {
      const [r, c] = stack.pop();
      if (r === n - 1 && c === n - 1) return true;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 && nr < n && nc >= 0 && nc < n &&
          !visited[nr][nc] && grid[nr][nc] <= t
        ) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
    return visited[n - 1][n - 1];
  }

  let lo = grid[0][0];
  let hi = n * n - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (canReach(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Complexity.** Time O(n² log(n²)) — binary search over O(n²) possible values, each check
O(n²), Space O(n²). (The Dijkstra-style min-heap approach is O(n² log n) in one pass.)

---

## Very Very Hard

### 20. The Boss Fight

Three implementation-heavy graph primitives that interviewers use to check whether you can
build the tools, not just call them. Pick your poison.

#### 20a. Implement Dijkstra's Algorithm From Scratch

**Problem.** Given `n` nodes, a weighted edge list, and a source node, implement Dijkstra's
shortest-path algorithm yourself — including the min-priority queue — and return the
shortest distance from the source to every node.

**Intuition.** JavaScript has no built-in priority queue, so a binary heap must be hand
rolled: an array-backed complete binary tree with `push` (bubble up) and `pop` (bubble
down) operations, ordered by distance. Dijkstra then repeatedly pops the closest unvisited
node and relaxes its edges — same shape as Network Delay Time, generalized to any source
and any edge list.

```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }
  size() {
    return this.heap.length;
  }
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  _bubbleDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

function dijkstra(n, edges, src, directed = false) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    if (!directed) adj[v].push([u, w]);
  }

  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const heap = new MinHeap();
  heap.push([0, src]);

  while (heap.size()) {
    const [d, u] = heap.pop();
    if (d > dist[u]) continue; // stale entry, a cheaper path was already found
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        heap.push([nd, v]);
      }
    }
  }
  return dist;
}
```

**Complexity.** Time O((V + E) log V) with the binary heap, Space O(V + E). (The naive
version that scans all unvisited nodes for the minimum each round is O(V²) and needs no
heap — simpler, and actually faster on dense graphs where E ≈ V².)

---

#### 20b. Generic Union-Find with Path Compression and Union by Rank

**Problem.** Implement a reusable Disjoint Set Union (Union-Find) class supporting
`find`, `union`, and `connected`, with path compression and union by rank. Then use it to
detect whether an undirected graph (given as an edge list) contains a cycle.

**Intuition.** `find` compresses paths so future lookups are near O(1). `union` attaches
the shorter tree under the taller one's root (by `rank`) to keep trees flat. For cycle
detection: process edges one at a time — if `union(a, b)` reports that `a` and `b` were
*already* in the same set, this edge connects two already-connected nodes, which means it
closes a cycle.

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n; // number of disjoint components
  }

  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; // path compression
      x = this.parent[x];
    }
    return x;
  }

  // returns false if x and y were already connected (this edge would form a cycle)
  union(x, y) {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;

    if (this.rank[rx] < this.rank[ry]) {
      this.parent[rx] = ry;
    } else if (this.rank[rx] > this.rank[ry]) {
      this.parent[ry] = rx;
    } else {
      this.parent[ry] = rx;
      this.rank[rx]++;
    }
    this.count--;
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}

function hasCycleUndirected(n, edges) {
  const uf = new UnionFind(n);
  for (const [a, b] of edges) {
    if (!uf.union(a, b)) return true; // a and b already connected -> cycle
  }
  return false;
}
```

**Complexity.** Time O(E · α(V)) ≈ O(E) amortized (α is the inverse Ackermann function,
effectively constant), Space O(V).

---

#### 20c. Find All Bridges Using Tarjan's Algorithm

**Problem.** Given `n` nodes and an undirected edge list (possibly with parallel edges),
find all bridges — edges whose removal increases the number of connected components.

**Intuition.** DFS while tracking each node's `disc` (discovery time) and `low` (the
lowest discovery time reachable from it, including through one back-edge). An edge
`(u, v)` where `v` is a DFS child of `u` is a bridge exactly when `low[v] > disc[u]` —
meaning `v`'s subtree has no back-edge reaching `u` or higher, so `v` is only connected to
the rest of the graph through that one edge. Each edge is tagged with a unique id so the
DFS skips only the specific parent *edge* (not just "the parent node"), which correctly
handles parallel edges between the same pair of nodes.

```javascript
function findBridges(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], edgeId) => {
    adj[a].push([b, edgeId]);
    adj[b].push([a, edgeId]);
  });

  const disc = new Array(n).fill(-1);
  const low = new Array(n).fill(-1);
  const bridges = [];
  let timer = 0;

  function dfs(node, parentEdgeId) {
    disc[node] = low[node] = timer++;

    for (const [next, edgeId] of adj[node]) {
      if (edgeId === parentEdgeId) continue; // skip the edge we arrived through
      if (disc[next] === -1) {
        dfs(next, edgeId);
        low[node] = Math.min(low[node], low[next]);
        if (low[next] > disc[node]) bridges.push([node, next]);
      } else {
        low[node] = Math.min(low[node], disc[next]); // back-edge
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (disc[i] === -1) dfs(i, -1);
  }
  return bridges;
}
```

**Complexity.** Time O(V + E), Space O(V + E).

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Grid flood fill (DFS/BFS) | 1, 2, 4, 8, 9 |
| Adjacency-list BFS/DFS basics | 3, 5, 10 |
| Topological sort (Kahn's / DFS) | 6, 7, 16 |
| Union-Find (Disjoint Set Union) | 11, 13, 18, 20b |
| Multi-source BFS | 8, 9 |
| Implicit-graph BFS shortest path | 12 |
| Dijkstra (single-source shortest path) | 14, 20a |
| Bellman-Ford / bounded relaxation | 15 |
| Eulerian path (Hierholzer's) | 17 |
| Minimum spanning tree | 18 |
| Binary search on answer over a graph | 19 |
| Tarjan's algorithm (low-link values) | 20c |

**Recommended progression:** 1 → 2 → 4 → 3 → 5 → 10 → 11 → 6 → 7 → 16 → 8 → 9 → 12 →
13 → 20b → 18 → 14 → 20a → 15 → 19 → 17 → 20c.
