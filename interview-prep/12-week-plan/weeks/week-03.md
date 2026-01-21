# Week 3: Trees & Binary Search Trees

**Time Commitment:** 8-9 hours  
**Focus:** Tree data structures, traversal algorithms, and async JavaScript

---

## Learning Objectives

By the end of this week, you should be able to:
- Implement BinaryTree and BST classes
- Master DFS (pre, in, post-order) and BFS traversals
- Solve common tree problems
- Understand async/await and Promises in JavaScript

---

## Day-by-Day Breakdown

### Day 1: Tree Fundamentals (1.5 hours)
**Study (45 min):**
- Read [DSA Trees section](../../coding/dsa/dsa-interview-questions.md#trees--binary-search-trees)
- Understand: tree terminology (root, leaf, depth, height)
- Learn: binary tree vs binary search tree

**Practice (45 min):**
- Implement basic TreeNode:
  ```javascript
  class TreeNode {
    constructor(val, left = null, right = null) {
      this.val = val;
      this.left = left;
      this.right = right;
    }
  }
  ```
- Implement BinaryTree class with basic operations

### Day 2: DFS Traversals (2 hours)
**Study (30 min):**
- Understand three DFS orders:
  - Pre-order: Root → Left → Right
  - In-order: Left → Root → Right
  - Post-order: Left → Right → Root

**Practice (1.5 hours):**
- Implement all three traversals (iterative and recursive):
  ```javascript
  // Recursive DFS
  function preorder(root) {
    if (!root) return [];
    return [root.val, ...preorder(root.left), ...preorder(root.right)];
  }
  
  // Iterative DFS using stack
  function preorderIterative(root) {
    if (!root) return [];
    const stack = [root];
    const result = [];
    // Implement...
  }
  ```
- LeetCode Easy: [Binary Tree Inorder Traversal](https://leetcode.com/problems/binary-tree-inorder-traversal/)

### Day 3: BFS Traversal (1.5 hours)
**Study (30 min):**
- Understand level-order traversal (BFS)
- Learn when to use BFS vs DFS

**Practice (1 hour):**
- Implement BFS using queue:
  ```javascript
  function levelOrder(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    // Implement...
  }
  ```
- LeetCode Medium: [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/)

### Day 4: Tree Problems (2 hours)
**Practice (2 hours):**
- LeetCode Easy: [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/)
- LeetCode Easy: [Same Tree](https://leetcode.com/problems/same-tree/)
- LeetCode Easy: [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/)
- LeetCode Medium: [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)

### Day 5: Core JavaScript - Async/Await (1 hour)
**Study (1 hour):**
- Review Promises: creation, chaining, error handling
- Understand async/await syntax
- Study Promise.all, Promise.race, Promise.allSettled
- Read: [Backend Advanced: Async Patterns](../../coding/questions/backend-advanced-questions.md#event-loop--async-architecture)
- Practice examples:
  ```javascript
  // Promise basics
  const fetchData = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve('data'), 1000);
    });
  };
  
  // Async/await
  async function getData() {
    try {
      const data = await fetchData();
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  
  // Promise.all
  const results = await Promise.all([
    fetchData1(),
    fetchData2(),
    fetchData3()
  ]);
  ```

### Day 6: BST Implementation (2 hours)
**Study (30 min):**
- Understand BST properties: left < root < right
- Learn BST operations: insert, search, delete

**Practice (1.5 hours):**
- Implement BST class:
  ```javascript
  class BST {
    constructor() {
      this.root = null;
    }
    
    insert(val) {
      // Implement insertion
    }
    
    search(val) {
      // Implement search
    }
    
    delete(val) {
      // Implement deletion (hardest operation)
    }
  }
  ```
- LeetCode Medium: [Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/)

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement all three DFS traversals?
- Can you explain when to use BFS vs DFS?
- Can you explain async/await vs Promises?

**Practice:**
- Solve one new tree problem
- Review traversal patterns

---

## Key Problems to Master

### Must Solve (Easy)
1. [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) - DFS
2. [Same Tree](https://leetcode.com/problems/same-tree/) - Recursive comparison
3. [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) - Tree manipulation

### Must Solve (Medium)
1. [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) - BST properties
2. [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) - BFS
3. [Binary Tree Inorder Traversal](https://leetcode.com/problems/binary-tree-inorder-traversal/) - DFS

---

## Study Materials

### Internal Resources
- [DSA Trees & BST](../../coding/dsa/dsa-interview-questions.md#trees--binary-search-trees)
- [Backend Advanced: Async Patterns](../../coding/questions/backend-advanced-questions.md#event-loop--async-architecture)

### External Resources
- LeetCode Tree Tag: https://leetcode.com/tag/tree/
- NeetCode Trees: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Recursive Tree Problems:**
   - Most tree problems use recursion
   - Base case: `if (!root) return ...`
   - Recursive case: process root, recurse left, recurse right

2. **BFS for Level Problems:**
   - Level-order traversal
   - Finding level-specific information

3. **BST Property:**
   - In-order traversal gives sorted order
   - Left < Root < Right

---

## Tips

- **Master recursion:** Most tree problems are recursive
- **Visualize:** Draw trees to understand structure
- **Practice traversals:** Know all three DFS orders by heart
- **Handle null cases:** Always check for null nodes

---

## Weekly Checklist

- [ ] Implemented BinaryTree class
- [ ] Implemented BST class with insert/search/delete
- [ ] Can implement all DFS traversals (iterative and recursive)
- [ ] Can implement BFS traversal
- [ ] Solved at least 6 tree problems
- [ ] Reviewed async/await and Promises
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 4 will cover Graphs & BFS/DFS. Make sure you're comfortable with:
- Tree traversals
- Recursive thinking
- BFS and DFS concepts
