# Week 9: Advanced DSA Patterns

**Time Commitment:** 7-8 hours  
**Focus:** Heaps, Tries, advanced tree problems, and database concepts

---

## Learning Objectives

By the end of this week, you should be able to:
- Understand and implement heaps
- Work with Tries (prefix trees)
- Solve advanced tree problems
- Understand database connection pooling

---

## Day-by-Day Breakdown

### Day 1: Heaps Fundamentals (2 hours)
**Study (1 hour):**
- Review [Coding Patterns: Heaps](../../coding/patterns/patterns-cheatsheet.md#7-heaps)
- Understand:
  - Min heap vs Max heap
  - Heap property
  - Heap operations: insert, extract, heapify

**Practice (1 hour):**
- Implement MinHeap:
  ```javascript
  class MinHeap {
    constructor() {
      this.heap = [];
    }
    
    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }
    
    insert(val) {
      this.heap.push(val);
      this.heapifyUp(this.heap.length - 1);
    }
    
    extractMin() {
      if (this.heap.length === 0) return null;
      if (this.heap.length === 1) return this.heap.pop();
      
      const min = this.heap[0];
      this.heap[0] = this.heap.pop();
      this.heapifyDown(0);
      return min;
    }
    
    heapifyUp(i) {
      while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
        [this.heap[i], this.heap[this.parent(i)]] = 
          [this.heap[this.parent(i)], this.heap[i]];
        i = this.parent(i);
      }
    }
    
    heapifyDown(i) {
      let smallest = i;
      const l = this.left(i);
      const r = this.right(i);
      
      if (l < this.heap.length && this.heap[l] < this.heap[smallest]) {
        smallest = l;
      }
      if (r < this.heap.length && this.heap[r] < this.heap[smallest]) {
        smallest = r;
      }
      
      if (smallest !== i) {
        [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
        this.heapifyDown(smallest);
      }
    }
  }
  ```

### Day 2: Heap Problems (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/) (using heap)
- LeetCode Hard: [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)
- LeetCode Medium: [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- Understand when to use heap vs sorting

### Day 3: Tries (Prefix Trees) (2 hours)
**Study (30 min):**
- Understand Trie structure
- Learn use cases: autocomplete, prefix matching

**Practice (1.5 hours):**
- Implement Trie:
  ```javascript
  class TrieNode {
    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }
  
  class Trie {
    constructor() {
      this.root = new TrieNode();
    }
    
    insert(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
    }
    
    search(word) {
      let node = this.root;
      for (const char of word) {
        if (!node.children[char]) return false;
        node = node.children[char];
      }
      return node.isEndOfWord;
    }
    
    startsWith(prefix) {
      let node = this.root;
      for (const char of prefix) {
        if (!node.children[char]) return false;
        node = node.children[char];
      }
      return true;
    }
  }
  ```
- LeetCode Medium: [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/)

### Day 4: Advanced Tree Problems (2 hours)
**Practice (2 hours):**
- LeetCode Hard: [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/)
- LeetCode Hard: [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
- Practice complex tree traversals and manipulations

### Day 5: Database Connection Pooling (1 hour)
**Study (1 hour):**
- Read [Backend Advanced: Database Pooling](../../coding/questions/backend-advanced-questions.md#database-connection-pooling)
- Understand:
  - Why connection pooling is needed
  - How connection pools work
  - Pool size configuration
- Review SQL basics:
  - SELECT, INSERT, UPDATE, DELETE
  - JOINs (INNER, LEFT, RIGHT)
  - Indexes and query optimization

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review heap operations
- Review Trie structure

**Practice (1.5 hours):**
- Re-solve Merge K Sorted Lists
- LeetCode Medium: [Design Twitter](https://leetcode.com/problems/design-twitter/) (uses heap)
- Practice explaining heap operations clearly

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement a heap?
- Can you explain when to use heap vs sorting?
- Can you implement a Trie?

**Practice:**
- Solve one new heap problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Medium)
1. [Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/) - Heap
2. [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) - Heap + Hash
3. [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/) - Trie

### Must Solve (Hard)
1. [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) - Heap
2. [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) - Tree traversal

---

## Study Materials

### Internal Resources
- [Coding Patterns: Heaps](../../coding/patterns/patterns-cheatsheet.md#7-heaps)
- [Backend Advanced: Database Pooling](../../coding/questions/backend-advanced-questions.md#database-connection-pooling)

### External Resources
- LeetCode Heap: https://leetcode.com/tag/heap/
- NeetCode Heaps: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Heap for Top K:**
   - Finding k largest/smallest
   - Maintaining k elements
   - O(n log k) time

2. **Trie for Prefix:**
   - Autocomplete
   - Prefix matching
   - Word search

3. **When to Use Heap:**
   - Need min/max quickly
   - Priority queue
   - Merge k sorted lists

---

## Tips

- **Understand heapify:** Know how to maintain heap property
- **Practice heap operations:** Insert and extract are key
- **Visualize Trie:** Draw the tree structure
- **SQL basics:** Review JOINs and indexes

---

## Weekly Checklist

- [ ] Implemented MinHeap from scratch
- [ ] Implemented Trie from scratch
- [ ] Solved at least 4-5 heap/trie problems
- [ ] Reviewed database connection pooling
- [ ] Reviewed SQL basics
- [ ] Can explain heap operations clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 10 will cover System Design Basics. Make sure you're comfortable with:
- Advanced data structures (heaps, tries)
- Database concepts
- Problem-solving patterns
