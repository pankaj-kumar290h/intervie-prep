/**
 * Data Structures — TypeScript reference implementations
 *
 * One class per data structure, meant for quick revision before interviews.
 * Every structure is generic where it makes sense and exposes the operations
 * you're expected to implement from scratch on a whiteboard.
 *
 * Sections:
 *   1.  Singly Linked List
 *   2.  Doubly Linked List
 *   3.  Stack
 *   4.  Queue
 *   5.  Circular Deque
 *   6.  Heap (Min/Max via comparator)
 *   7.  Binary Search Tree
 *   8.  Trie (Prefix Tree)
 *   9.  Graph (adjacency list, BFS/DFS)
 *   10. Union-Find (Disjoint Set Union)
 *   11. LRU Cache
 *   12. Segment Tree (range sum, point update)
 */

// ============================================================
// 1. Singly Linked List
// ============================================================

class SLLNode<T> {
  val: T;
  next: SLLNode<T> | null = null;
  constructor(val: T) {
    this.val = val;
  }
}

class SinglyLinkedList<T> {
  head: SLLNode<T> | null = null;
  tail: SLLNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  pushBack(val: T): void {
    const node = new SLLNode(val);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this._size++;
  }

  pushFront(val: T): void {
    const node = new SLLNode(val);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
    this._size++;
  }

  popFront(): T | undefined {
    if (!this.head) return undefined;
    const node = this.head;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return node.val;
  }

  find(val: T): SLLNode<T> | null {
    let curr = this.head;
    while (curr) {
      if (curr.val === val) return curr;
      curr = curr.next;
    }
    return null;
  }

  reverse(): void {
    let prev: SLLNode<T> | null = null;
    let curr = this.head;
    this.tail = curr;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.head = prev;
  }

  toArray(): T[] {
    const out: T[] = [];
    let curr = this.head;
    while (curr) {
      out.push(curr.val);
      curr = curr.next;
    }
    return out;
  }
}

// ============================================================
// 2. Doubly Linked List
// ============================================================

class DLLNode<T> {
  val: T;
  prev: DLLNode<T> | null = null;
  next: DLLNode<T> | null = null;
  constructor(val: T) {
    this.val = val;
  }
}

class DoublyLinkedList<T> {
  head: DLLNode<T> | null = null;
  tail: DLLNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  pushBack(val: T): DLLNode<T> {
    const node = new DLLNode(val);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
    return node;
  }

  pushFront(val: T): DLLNode<T> {
    const node = new DLLNode(val);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
    return node;
  }

  remove(node: DLLNode<T>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this._size--;
  }

  toArray(): T[] {
    const out: T[] = [];
    let curr = this.head;
    while (curr) {
      out.push(curr.val);
      curr = curr.next;
    }
    return out;
  }
}

// ============================================================
// 3. Stack (array-backed, O(1) push/pop/peek)
// ============================================================

class Stack<T> {
  private items: T[] = [];

  push(val: T): void {
    this.items.push(val);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

// ============================================================
// 4. Queue (array-backed with a read pointer so dequeue is
//    amortized O(1) instead of O(n) from Array#shift)
// ============================================================

class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(val: T): void {
    this.items.push(val);
  }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const val = this.items[this.head];
    this.items[this.head] = undefined as unknown as T;
    this.head++;
    // Reclaim space once the drained prefix dominates the array.
    if (this.head > 1024 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return val;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head >= this.items.length;
  }

  get size(): number {
    return this.items.length - this.head;
  }
}

// ============================================================
// 5. Circular Deque (fixed-capacity ring buffer, O(1) on all ends)
// ============================================================

class CircularDeque<T> {
  private buf: (T | undefined)[];
  private front = 0;
  private count = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buf = new Array(capacity);
  }

  insertFront(val: T): boolean {
    if (this.count === this.capacity) return false;
    this.front = (this.front - 1 + this.capacity) % this.capacity;
    this.buf[this.front] = val;
    this.count++;
    return true;
  }

  insertLast(val: T): boolean {
    if (this.count === this.capacity) return false;
    const idx = (this.front + this.count) % this.capacity;
    this.buf[idx] = val;
    this.count++;
    return true;
  }

  deleteFront(): boolean {
    if (this.count === 0) return false;
    this.buf[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return true;
  }

  deleteLast(): boolean {
    if (this.count === 0) return false;
    const idx = (this.front + this.count - 1) % this.capacity;
    this.buf[idx] = undefined;
    this.count--;
    return true;
  }

  getFront(): T | undefined {
    return this.count === 0 ? undefined : this.buf[this.front];
  }

  getRear(): T | undefined {
    if (this.count === 0) return undefined;
    return this.buf[(this.front + this.count - 1) % this.capacity];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }
}

// ============================================================
// 6. Heap (comparator-based; default is a min-heap)
//    Pass (a, b) => b - a for a max-heap.
// ============================================================

class Heap<T> {
  private items: T[] = [];
  private readonly compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = (a, b) => (a as unknown as number) - (b as unknown as number)) {
    this.compare = compare;
  }

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(val: T): void {
    this.items.push(val);
    this.siftUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.items[i], this.items[parent]) >= 0) break;
      [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.items.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
      if (right < n && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
      i = smallest;
    }
  }
}

// ============================================================
// 7. Binary Search Tree
// ============================================================

class BSTNode<T> {
  val: T;
  left: BSTNode<T> | null = null;
  right: BSTNode<T> | null = null;
  constructor(val: T) {
    this.val = val;
  }
}

class BinarySearchTree<T> {
  root: BSTNode<T> | null = null;

  insert(val: T): void {
    const node = new BSTNode(val);
    if (!this.root) {
      this.root = node;
      return;
    }
    let curr = this.root;
    while (true) {
      if (val === curr.val) return; // no duplicates
      if (val < curr.val) {
        if (!curr.left) {
          curr.left = node;
          return;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = node;
          return;
        }
        curr = curr.right;
      }
    }
  }

  find(val: T): BSTNode<T> | null {
    let curr = this.root;
    while (curr) {
      if (val === curr.val) return curr;
      curr = val < curr.val ? curr.left : curr.right;
    }
    return null;
  }

  remove(val: T): void {
    this.root = this.removeNode(this.root, val);
  }

  private removeNode(node: BSTNode<T> | null, val: T): BSTNode<T> | null {
    if (!node) return null;
    if (val < node.val) {
      node.left = this.removeNode(node.left, val);
      return node;
    }
    if (val > node.val) {
      node.right = this.removeNode(node.right, val);
      return node;
    }
    // val === node.val
    if (!node.left) return node.right;
    if (!node.right) return node.left;

    // Two children: replace with in-order successor (min of right subtree).
    let successor = node.right;
    while (successor.left) successor = successor.left;
    node.val = successor.val;
    node.right = this.removeNode(node.right, successor.val);
    return node;
  }

  inorder(): T[] {
    const out: T[] = [];
    const walk = (node: BSTNode<T> | null): void => {
      if (!node) return;
      walk(node.left);
      out.push(node.val);
      walk(node.right);
    };
    walk(this.root);
    return out;
  }
}

// ============================================================
// 8. Trie (Prefix Tree)
// ============================================================

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    const node = this.walk(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null;
  }

  private walk(str: string): TrieNode | null {
    let node = this.root;
    for (const ch of str) {
      const next = node.children.get(ch);
      if (!next) return null;
      node = next;
    }
    return node;
  }
}

// ============================================================
// 9. Graph (adjacency list; works for directed/undirected,
//    weighted/unweighted)
// ============================================================

class Graph<T> {
  private adj: Map<T, Array<{ node: T; weight: number }>> = new Map();
  private readonly directed: boolean;

  constructor(directed = false) {
    this.directed = directed;
  }

  addVertex(v: T): void {
    if (!this.adj.has(v)) this.adj.set(v, []);
  }

  addEdge(u: T, v: T, weight = 1): void {
    this.addVertex(u);
    this.addVertex(v);
    this.adj.get(u)!.push({ node: v, weight });
    if (!this.directed) this.adj.get(v)!.push({ node: u, weight });
  }

  neighbors(v: T): Array<{ node: T; weight: number }> {
    return this.adj.get(v) ?? [];
  }

  bfs(start: T): T[] {
    const visited = new Set<T>([start]);
    const order: T[] = [];
    const queue: T[] = [start];
    let i = 0;
    while (i < queue.length) {
      const curr = queue[i++];
      order.push(curr);
      for (const { node } of this.neighbors(curr)) {
        if (!visited.has(node)) {
          visited.add(node);
          queue.push(node);
        }
      }
    }
    return order;
  }

  dfs(start: T): T[] {
    const visited = new Set<T>();
    const order: T[] = [];
    const walk = (v: T): void => {
      visited.add(v);
      order.push(v);
      for (const { node } of this.neighbors(v)) {
        if (!visited.has(node)) walk(node);
      }
    };
    walk(start);
    return order;
  }

  // Dijkstra's shortest path from `start` (non-negative weights).
  shortestPaths(start: T): Map<T, number> {
    const dist = new Map<T, number>([[start, 0]]);
    const heap = new Heap<{ node: T; dist: number }>((a, b) => a.dist - b.dist);
    heap.push({ node: start, dist: 0 });

    while (heap.size > 0) {
      const { node: u, dist: d } = heap.pop()!;
      if (d > (dist.get(u) ?? Infinity)) continue;
      for (const { node: v, weight } of this.neighbors(u)) {
        const nd = d + weight;
        if (nd < (dist.get(v) ?? Infinity)) {
          dist.set(v, nd);
          heap.push({ node: v, dist: nd });
        }
      }
    }
    return dist;
  }
}

// ============================================================
// 10. Union-Find (Disjoint Set Union) with path compression
//     and union by rank
// ============================================================

class UnionFind {
  private parent: number[];
  private rank: number[];
  private count: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false; // already connected — union would create a cycle

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

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  get numComponents(): number {
    return this.count;
  }
}

// ============================================================
// 11. LRU Cache (Map preserves insertion order, so re-inserting
//     a key on access/update doubles as the recency list)
// ============================================================

class LRUCache<K, V> {
  private readonly capacity: number;
  private map = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val); // move to most-recently-used
    return val;
  }

  put(key: K, val: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) {
      const lruKey = this.map.keys().next().value as K;
      this.map.delete(lruKey);
    }
    this.map.set(key, val);
  }
}

// ============================================================
// 12. Segment Tree (range sum query, point update)
// ============================================================

class SegmentTree {
  private tree: number[];
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.tree = new Array(4 * this.n).fill(0);
    if (this.n > 0) this.build(data, 0, 0, this.n - 1);
  }

  private build(data: number[], node: number, lo: number, hi: number): void {
    if (lo === hi) {
      this.tree[node] = data[lo];
      return;
    }
    const mid = (lo + hi) >> 1;
    this.build(data, 2 * node + 1, lo, mid);
    this.build(data, 2 * node + 2, mid + 1, hi);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }

  update(index: number, value: number): void {
    this.updateNode(0, 0, this.n - 1, index, value);
  }

  private updateNode(node: number, lo: number, hi: number, index: number, value: number): void {
    if (lo === hi) {
      this.tree[node] = value;
      return;
    }
    const mid = (lo + hi) >> 1;
    if (index <= mid) this.updateNode(2 * node + 1, lo, mid, index, value);
    else this.updateNode(2 * node + 2, mid + 1, hi, index, value);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }

  // Sum over [l, r], inclusive.
  query(l: number, r: number): number {
    return this.queryNode(0, 0, this.n - 1, l, r);
  }

  private queryNode(node: number, lo: number, hi: number, l: number, r: number): number {
    if (r < lo || hi < l) return 0; // no overlap
    if (l <= lo && hi <= r) return this.tree[node]; // total overlap
    const mid = (lo + hi) >> 1;
    return (
      this.queryNode(2 * node + 1, lo, mid, l, r) +
      this.queryNode(2 * node + 2, mid + 1, hi, l, r)
    );
  }
}

export {
  SinglyLinkedList,
  DoublyLinkedList,
  Stack,
  Queue,
  CircularDeque,
  Heap,
  BinarySearchTree,
  Trie,
  Graph,
  UnionFind,
  LRUCache,
  SegmentTree,
};
