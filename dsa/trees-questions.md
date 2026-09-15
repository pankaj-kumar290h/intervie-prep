# Tree & BST Interview Questions — Easy → Very Very Hard

20 curated binary tree and BST problems with problem statements, intuition, JavaScript
solutions, and complexity analysis. Ordered by increasing difficulty.

## Table of Contents

**Easy**
1. [Maximum Depth of Binary Tree](#1-maximum-depth-of-binary-tree)
2. [Invert Binary Tree](#2-invert-binary-tree)
3. [Same Tree](#3-same-tree)
4. [Symmetric Tree](#4-symmetric-tree)
5. [Path Sum](#5-path-sum)

**Medium**
6. [Validate Binary Search Tree](#6-validate-binary-search-tree)
7. [Lowest Common Ancestor of a Binary Search Tree](#7-lowest-common-ancestor-of-a-binary-search-tree)
8. [Kth Smallest Element in a BST](#8-kth-smallest-element-in-a-bst)
9. [Binary Tree Zigzag Level Order Traversal](#9-binary-tree-zigzag-level-order-traversal)
10. [Construct Binary Tree from Preorder and Inorder Traversal](#10-construct-binary-tree-from-preorder-and-inorder-traversal)
11. [Diameter of Binary Tree](#11-diameter-of-binary-tree)
12. [Balanced Binary Tree](#12-balanced-binary-tree)
13. [Path Sum II](#13-path-sum-ii)

**Hard**
14. [Serialize and Deserialize Binary Tree](#14-serialize-and-deserialize-binary-tree)
15. [Binary Tree Maximum Path Sum](#15-binary-tree-maximum-path-sum)
16. [Lowest Common Ancestor of a Binary Tree](#16-lowest-common-ancestor-of-a-binary-tree)
17. [Recover Binary Search Tree](#17-recover-binary-search-tree)

**Very Hard**
18. [Vertical Order Traversal of a Binary Tree](#18-vertical-order-traversal-of-a-binary-tree)
19. [Binary Tree Cameras](#19-binary-tree-cameras)

**Very Very Hard**
20. [Trie + Word Search II + Segment Tree](#20-the-boss-fight)

---

Every problem below operates on a simple binary tree node:

```javascript
function TreeNode(val, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}
```

## Easy

### 1. Maximum Depth of Binary Tree

**Problem.** Given the root of a binary tree, return its maximum depth (number of nodes
along the longest root-to-leaf path).

**Intuition.** The depth of a tree is 1 (for the root) plus the deeper of its two
subtrees' depths. A null node has depth 0. This is a one-line recursion.

```javascript
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

**Complexity.** Time O(n), Space O(h) for the recursion stack, where `h` is the tree
height (O(n) worst case on a skewed tree, O(log n) if balanced).

---

### 2. Invert Binary Tree

**Problem.** Given the root of a binary tree, swap every node's left and right child and
return the root.

**Intuition.** Recursively invert both subtrees, then swap the (already-inverted)
children at the current node. Order doesn't matter as long as you invert before or after
swapping consistently.

```javascript
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack. (An iterative BFS/DFS with an
explicit stack/queue also works in O(n) time, O(n) space worst case.)

---

### 3. Same Tree

**Problem.** Given the roots of two binary trees, return `true` if they are structurally
identical and their nodes have the same values.

**Intuition.** Two trees are the same if both roots are null, or both are non-null with
equal values and recursively identical left and right subtrees.

```javascript
function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 4. Symmetric Tree

**Problem.** Given the root of a binary tree, check whether it is a mirror of itself
(symmetric around its center).

**Intuition.** A tree is symmetric if its left and right subtrees are mirror images: the
outer pair (`left.left`, `right.right`) and inner pair (`left.right`, `right.left`) must
each match recursively.

```javascript
function isSymmetric(root) {
  function mirror(a, b) {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  return !root || mirror(root.left, root.right);
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 5. Path Sum

**Problem.** Given the root of a binary tree and an integer `targetSum`, return `true` if
the tree has a root-to-leaf path such that the sum of values along the path equals
`targetSum`.

**Intuition.** Subtract the current node's value from the target as you descend. At a
leaf, check whether the remaining target has hit exactly zero.

```javascript
function hasPathSum(root, targetSum) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === targetSum;
  const remaining = targetSum - root.val;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

## Medium

### 6. Validate Binary Search Tree

**Problem.** Given the root of a binary tree, determine if it is a valid BST (every
node's value strictly greater than all values in its left subtree and strictly less than
all values in its right subtree).

**Intuition.** A local check (`node.left.val < node.val < node.right.val`) is not enough
— a node deep in the left subtree could still violate an ancestor's bound. Carry a
`(min, max)` open range down the recursion, tightening it at every step.

```javascript
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}
```

**Complexity.** Time O(n), Space O(h) recursion stack. (An inorder traversal that checks
strictly-increasing order is an equally common alternative.)

---

### 7. Lowest Common Ancestor of a Binary Search Tree

**Problem.** Given a BST and two nodes `p` and `q` known to exist in it, find their
lowest common ancestor (the deepest node that has both as descendants, a node can be its
own descendant).

**Intuition.** BST ordering tells you which way to go without comparing subtrees: if both
`p` and `q` are smaller than the current node, the LCA is in the left subtree; if both are
larger, it's in the right subtree; otherwise the current node is the split point — the LCA.

```javascript
function lowestCommonAncestorBST(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node;
  }
  return null;
}
```

**Complexity.** Time O(h), Space O(1) (iterative). A recursive version is O(h) space for
the call stack.

---

### 8. Kth Smallest Element in a BST

**Problem.** Given the root of a BST and an integer `k`, return the `k`-th smallest value
(1-indexed) among all node values.

**Intuition.** An inorder traversal of a BST visits values in ascending order. Do an
iterative inorder traversal with an explicit stack and stop as soon as you've popped the
`k`-th node, avoiding building the full sorted list.

```javascript
function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}
```

**Complexity.** Time O(h + k), Space O(h) for the stack.

---

### 9. Binary Tree Zigzag Level Order Traversal

**Problem.** Given the root of a binary tree, return the zigzag level order traversal of
its node values (left to right, then right to left for the next level, alternating).

**Intuition.** Do a standard BFS level by level. Collect each level's values in normal
left-to-right order, then reverse the array before appending it if the level index is
odd.

```javascript
function zigzagLevelOrder(root) {
  if (!root) return [];
  const res = [];
  let queue = [root];
  let leftToRight = true;

  while (queue.length) {
    const level = [];
    const next = [];
    for (const node of queue) {
      level.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    res.push(leftToRight ? level : level.reverse());
    leftToRight = !leftToRight;
    queue = next;
  }
  return res;
}
```

**Complexity.** Time O(n), Space O(n) for the queue and output.

---

### 10. Construct Binary Tree from Preorder and Inorder Traversal

**Problem.** Given `preorder` and `inorder` traversal arrays of a binary tree with unique
values, reconstruct and return the tree.

**Intuition.** Preorder's first element is always the current subtree's root. Find that
value in `inorder` — everything to its left is the left subtree's inorder sequence,
everything to its right is the right subtree's. A map from value → inorder index gives
O(1) lookups, and a shared preorder cursor advances as each root is consumed.

```javascript
function buildTree(preorder, inorder) {
  const indexMap = new Map();
  inorder.forEach((val, i) => indexMap.set(val, i));
  let preIdx = 0;

  function build(inLo, inHi) {
    if (inLo > inHi) return null;
    const rootVal = preorder[preIdx++];
    const node = new TreeNode(rootVal);
    const mid = indexMap.get(rootVal);
    node.left = build(inLo, mid - 1);
    node.right = build(mid + 1, inHi);
    return node;
  }

  return build(0, inorder.length - 1);
}
```

**Complexity.** Time O(n), Space O(n) for the index map plus O(h) recursion stack.

---

### 11. Diameter of Binary Tree

**Problem.** Given the root of a binary tree, return the length (in edges) of the longest
path between any two nodes. The path may or may not pass through the root.

**Intuition.** The longest path through any given node is `leftHeight + rightHeight`.
Compute height bottom-up and, while doing so, update a global best with that sum at every
node — the diameter doesn't have to pass through the root.

```javascript
function diameterOfBinaryTree(root) {
  let best = 0;

  function height(node) {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }

  height(root);
  return best;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 12. Balanced Binary Tree

**Problem.** Given the root of a binary tree, determine if it is height-balanced (the
depths of the two subtrees of every node never differ by more than 1).

**Intuition.** A naive solution recomputes height at every node (O(n²)). Instead, compute
height bottom-up and short-circuit: if a subtree is already found unbalanced, propagate a
sentinel (`-1`) up immediately instead of continuing to compute heights.

```javascript
function isBalanced(root) {
  function height(node) {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
  return height(root) !== -1;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 13. Path Sum II

**Problem.** Given the root of a binary tree and an integer `targetSum`, return all
root-to-leaf paths where the sum of values along the path equals `targetSum`.

**Intuition.** DFS while maintaining a running path array and remaining sum. At a leaf
that hits exactly zero remaining, snapshot (copy) the path into the results. Backtrack by
popping the path after exploring both children.

```javascript
function pathSum(root, targetSum) {
  const res = [];
  const path = [];

  function dfs(node, remaining) {
    if (!node) return;
    path.push(node.val);
    remaining -= node.val;

    if (!node.left && !node.right && remaining === 0) {
      res.push([...path]);
    } else {
      dfs(node.left, remaining);
      dfs(node.right, remaining);
    }
    path.pop();
  }

  dfs(root, targetSum);
  return res;
}
```

**Complexity.** Time O(n²) worst case (copying an O(n)-length path at up to O(n) leaves),
Space O(h) recursion stack plus O(n) for the output paths.

---

## Hard

### 14. Serialize and Deserialize Binary Tree

**Problem.** Design an algorithm to serialize a binary tree to a string and deserialize
that string back to the original tree structure (values need not be unique).

**Intuition.** Preorder traversal with explicit null markers is self-describing: writing
`root, left-subtree, right-subtree` (with `#` for nulls) lets deserialization rebuild the
tree by consuming tokens in the same order it wrote them, with no need for inorder or
index bookkeeping.

```javascript
function serialize(root) {
  const out = [];

  function dfs(node) {
    if (!node) {
      out.push('#');
      return;
    }
    out.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return out.join(',');
}

function deserialize(data) {
  const values = data.split(',');
  let i = 0;

  function build() {
    const token = values[i++];
    if (token === '#') return null;
    const node = new TreeNode(Number(token));
    node.left = build();
    node.right = build();
    return node;
  }

  return build();
}
```

**Complexity.** Time O(n) for both directions, Space O(n) for the serialized string plus
O(h) recursion stack.

---

### 15. Binary Tree Maximum Path Sum

**Problem.** Given a binary tree, find the maximum path sum, where a path is any sequence
of nodes connected by edges, and a node cannot appear more than once. The path does not
need to pass through the root.

**Intuition.** For each node, compute the max "downward gain" it can contribute to a path
passing through its parent (`node.val + max(0, best single child gain)` — negative child
contributions are clamped to 0, i.e. not taken). While computing that, also check the best
path that turns at this node, using *both* children's gains — that candidate updates a
global maximum but cannot itself be returned upward, since a path can't branch twice.

```javascript
function maxPathSum(root) {
  let best = -Infinity;

  function gain(node) {
    if (!node) return 0;
    const leftGain = Math.max(gain(node.left), 0);
    const rightGain = Math.max(gain(node.right), 0);

    best = Math.max(best, node.val + leftGain + rightGain);
    return node.val + Math.max(leftGain, rightGain);
  }

  gain(root);
  return best;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 16. Lowest Common Ancestor of a Binary Tree

**Problem.** Given a general (not necessarily sorted) binary tree and two nodes `p` and
`q` known to exist in it, find their lowest common ancestor.

**Intuition.** Without BST ordering, search both subtrees. If a node itself is `p` or
`q`, it's a candidate ancestor of itself — return it up immediately. If a node's left and
right recursive calls both come back non-null, `p` and `q` were found in different
subtrees, so this node is the split point (the LCA). Otherwise, propagate whichever side
found something.

```javascript
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;
  return left || right;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack.

---

### 17. Recover Binary Search Tree

**Problem.** Exactly two nodes of a BST have had their values accidentally swapped.
Recover the tree without changing its structure, using O(1) extra space (no recursion
stack or auxiliary array).

**Intuition.** An inorder traversal of a valid BST is strictly increasing. With two
values swapped, the sequence has either one or two adjacent inversions
(`prev.val > curr.val`). The first inversion's earlier node is the first swapped value;
the later inversion's later node (or the same inversion's later node if there's only one)
is the second. Use **Morris inorder traversal** — which temporarily threads `null`
right-child pointers to predecessors instead of using a stack — to get true O(1) space.

```javascript
function recoverTree(root) {
  let first = null;
  let second = null;
  let prev = null;
  let curr = root;

  while (curr) {
    if (!curr.left) {
      if (prev && prev.val > curr.val) {
        if (!first) first = prev;
        second = curr;
      }
      prev = curr;
      curr = curr.right;
    } else {
      let pred = curr.left;
      while (pred.right && pred.right !== curr) pred = pred.right;

      if (!pred.right) {
        pred.right = curr; // thread to predecessor
        curr = curr.left;
      } else {
        pred.right = null; // remove thread, restoring the tree
        if (prev && prev.val > curr.val) {
          if (!first) first = prev;
          second = curr;
        }
        prev = curr;
        curr = curr.right;
      }
    }
  }

  if (first && second) [first.val, second.val] = [second.val, first.val];
}
```

**Complexity.** Time O(n), Space O(1). (A plain recursive/stack-based inorder traversal
solves it in O(h) space, which is the usual first pass before the O(1) follow-up.)

---

## Very Hard

### 18. Vertical Order Traversal of a Binary Tree

**Problem.** Given the root of a binary tree, return its vertical order traversal: group
node values by column (root at column 0, left child column − 1, right child column + 1),
ordered left-to-right by column. Within a column, order top-to-bottom by row; if two
nodes share the same row *and* column, order them by ascending value.

**Intuition.** The tie-breaking rule is the whole difficulty here. Collect every node as
`[col, row, val]` triples via any traversal, then sort by `col`, then `row`, then `val` —
that single three-key sort handles ties correctly without any special-casing during the
traversal itself. Finally, bucket the sorted triples by column.

```javascript
function verticalTraversal(root) {
  const nodes = []; // [col, row, val]

  function dfs(node, row, col) {
    if (!node) return;
    nodes.push([col, row, node.val]);
    dfs(node.left, row + 1, col - 1);
    dfs(node.right, row + 1, col + 1);
  }

  dfs(root, 0, 0);
  nodes.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

  const res = [];
  let lastCol = null;
  for (const [col, , val] of nodes) {
    if (col !== lastCol) {
      res.push([]);
      lastCol = col;
    }
    res[res.length - 1].push(val);
  }
  return res;
}
```

**Complexity.** Time O(n log n) for the sort, Space O(n) for the collected triples.

---

### 19. Binary Tree Cameras

**Problem.** Given a binary tree, install cameras on some nodes so that every node is
either covered (adjacent to a camera or itself has one) or has a camera. A camera on a
node monitors itself, its parent, and its direct children. Return the minimum number of
cameras needed.

**Intuition.** Greedy, bottom-up: to minimize cameras, a node should only get one when
forced — i.e., when one of its children is uncovered. Post-order DFS returns one of three
states per node: `NOT_COVERED`, `COVERED` (but no camera), or `HAS_CAMERA`. If either
child is `NOT_COVERED`, place a camera here. If neither is `NOT_COVERED` but at least one
`HAS_CAMERA`, this node is covered for free. Otherwise it's uncovered, deferring the
decision to its parent. The root needs a final check since nothing covers it from above.

```javascript
function minCameraCover(root) {
  let cameras = 0;
  const NOT_COVERED = 0;
  const COVERED = 1;
  const HAS_CAMERA = 2;

  function dfs(node) {
    if (!node) return COVERED;

    const left = dfs(node.left);
    const right = dfs(node.right);

    if (left === NOT_COVERED || right === NOT_COVERED) {
      cameras++;
      return HAS_CAMERA;
    }
    if (left === HAS_CAMERA || right === HAS_CAMERA) return COVERED;
    return NOT_COVERED;
  }

  if (dfs(root) === NOT_COVERED) cameras++;
  return cameras;
}
```

**Complexity.** Time O(n), Space O(h) recursion stack. (Proving the greedy is optimal is
the hard part of this problem, not the code.)

---

## Very Very Hard

### 20. The Boss Fight

Three problems built around trie and tree structures that go well beyond a plain
traversal — the kind interviewers reach for when they want to see design skills, not just
DFS.

#### 20a. Implement a Trie (Prefix Tree)

**Problem.** Design a trie supporting `insert(word)`, `search(word)` (exact match), and
`startsWith(prefix)` (any word begins with this prefix).

**Intuition.** Each node holds a map from character → child node and a boolean marking
"a word ends here." `insert` walks/creates nodes character by character and flags the
last one. `search` and `startsWith` both walk the same path; they differ only in whether
they require the final node's end-flag to be set.

```javascript
class Trie {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }

  insert(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new Trie());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  _find(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch);
    }
    return node;
  }

  search(word) {
    const node = this._find(word);
    return !!node && node.isEnd;
  }

  startsWith(prefix) {
    return this._find(prefix) !== null;
  }
}
```

**Complexity.** `insert`/`search`/`startsWith` are all Time O(L) where `L` is the word or
prefix length, Space O(ALPHABET_SIZE · N · L) worst case across all inserted words.

---

#### 20b. Word Search II

**Problem.** Given an `m x n` board of characters and a list of `words`, return all words
from the list that can be formed by a path of adjacent (up/down/left/right) cells,
without reusing a cell within a single word.

**Intuition.** Checking each word independently against the board (DFS per word) is
O(words · cells · 4^L) — too slow when many words share prefixes. Instead, insert all
words into a shared trie, then do one DFS per board cell, walking the trie in lockstep
with the board path. This shares work across words with common prefixes and lets you
prune: stop descending the moment the board path leaves the trie, and delete trie
branches once they're exhausted (no children left) so dead ends aren't revisited.

```javascript
function findWords(board, words) {
  const root = new Trie();
  for (const w of words) root.insert(w);

  const rows = board.length;
  const cols = board[0].length;
  const found = [];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(r, c, node, path) {
    const ch = board[r][c];
    const next = node.children.get(ch);
    if (!next) return;

    path += ch;
    if (next.isEnd) {
      found.push(path);
      next.isEnd = false; // avoid pushing the same word twice
    }

    board[r][c] = '#'; // mark visited
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== '#') {
        dfs(nr, nc, next, path);
      }
    }
    board[r][c] = ch; // restore

    if (next.children.size === 0) node.children.delete(ch); // prune dead branch
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root, '');
    }
  }

  return found;
}
```

**Complexity.** Time O(m · n · 4^L) worst case (`L` = longest word length), substantially
better in practice due to trie pruning shared across words. Space O(sum of word lengths)
for the trie plus O(L) recursion stack.

---

#### 20c. Segment Tree for Range Sum Query with Point Updates

**Problem.** Given an array `nums`, support two operations efficiently: `update(index,
value)` — set `nums[index] = value`, and `query(left, right)` — return the sum of
`nums[left..right)` (half-open range).

**Intuition.** A segment tree stores range sums in a binary structure over the array: leaf
`i` holds `nums[i]`, and each internal node holds the sum of its two children's ranges.
Build it bottom-up in one array (leaves at indices `[n, 2n)`, node `i`'s children at `2i`
and `2i+1`). An update only touches the O(log n) ancestors of a leaf. A query walks two
pointers inward from the range's edges, adding in any node whose full range lies entirely
inside the query.

```javascript
class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(2 * this.n).fill(0);
    this.build(nums);
  }

  build(nums) {
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = nums[i];
    for (let i = this.n - 1; i > 0; i--) {
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }
  }

  update(index, value) {
    let i = index + this.n;
    this.tree[i] = value;
    while (i > 1) {
      i >>= 1;
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }
  }

  // sum of nums[left..right), half-open
  query(left, right) {
    let sum = 0;
    left += this.n;
    right += this.n;
    while (left < right) {
      if (left & 1) sum += this.tree[left++];
      if (right & 1) sum += this.tree[--right];
      left >>= 1;
      right >>= 1;
    }
    return sum;
  }
}
```

**Complexity.** `build` Time O(n), Space O(n). `update` and `query` are both Time
O(log n), Space O(1). (This iterative array-based layout avoids the O(4n) recursive/
lazy-propagation tree used for range *updates* — that variant is needed only if updates
must also apply to ranges, not single points.)

---

## Study Order & Patterns

| Pattern | Questions |
| --- | --- |
| Basic recursion on tree shape | 1, 2, 3, 4, 5 |
| Bottom-up height/state with global accumulator | 11, 12, 15, 19 |
| BST ordering invariant | 6, 7, 8, 17 |
| Level-order BFS | 9 |
| Traversal-array reconstruction | 10, 14 |
| Backtracking with path snapshot | 13 |
| Split-point / multi-branch search | 16 |
| Morris (threaded) traversal for O(1) space | 17 |
| Coordinate collection + sort | 18 |
| Trie (prefix tree) | 20a, 20b |
| Segment tree / range queries | 20c |

**Recommended progression:** 1 → 2 → 3 → 4 → 5 → 12 → 11 → 6 → 7 → 8 → 9 → 13 → 10 →
16 → 15 → 14 → 17 → 18 → 19 → 20.
