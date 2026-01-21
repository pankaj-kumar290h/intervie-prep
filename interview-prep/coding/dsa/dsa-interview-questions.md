# Data Structures & Algorithms for JavaScript Interviews

## Table of Contents
1. [Arrays & Strings](#arrays--strings)
2. [Hash Tables](#hash-tables)
3. [Linked Lists](#linked-lists)
4. [Stacks & Queues](#stacks--queues)
5. [Trees & Binary Search Trees](#trees--binary-search-trees)
6. [Graphs](#graphs)
7. [Dynamic Programming](#dynamic-programming)
8. [Sorting & Searching](#sorting--searching)
9. [Sliding Window & Two Pointers](#sliding-window--two-pointers)
10. [Common Patterns](#common-patterns)

---

## Arrays & Strings

### 1. Two Sum

```javascript
/**
 * Find two numbers that add up to target
 * Time: O(n), Space: O(n)
 */
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}

// Three Sum - Find all triplets that sum to zero
// Time: O(n²), Space: O(1)
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);
  
  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicates
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        // Skip duplicates
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}
```

### 2. Maximum Subarray (Kadane's Algorithm)

```javascript
/**
 * Find contiguous subarray with maximum sum
 * Time: O(n), Space: O(1)
 */
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Either start fresh from current element or extend previous sum
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// Return the actual subarray
function maxSubArrayWithIndices(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  let start = 0, end = 0, tempStart = 0;
  
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > currentSum + nums[i]) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum = currentSum + nums[i];
    }
    
    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }
  
  return {
    maxSum,
    subarray: nums.slice(start, end + 1)
  };
}
```

### 3. Merge Intervals

```javascript
/**
 * Merge overlapping intervals
 * Time: O(n log n), Space: O(n)
 */
function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // Sort by start time
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];
    
    if (current[0] <= lastMerged[1]) {
      // Overlapping - merge
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      // Non-overlapping - add new interval
      merged.push(current);
    }
  }
  
  return merged;
}

// Insert and merge a new interval
function insertInterval(intervals, newInterval) {
  const result = [];
  let i = 0;
  
  // Add all intervals that end before newInterval starts
  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }
  
  // Merge overlapping intervals
  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }
  result.push(newInterval);
  
  // Add remaining intervals
  while (i < intervals.length) {
    result.push(intervals[i]);
    i++;
  }
  
  return result;
}
```

### 4. String Manipulation

```javascript
/**
 * Valid Palindrome
 */
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  
  return true;
}

/**
 * Longest Palindromic Substring
 * Time: O(n²), Space: O(1)
 */
function longestPalindrome(s) {
  if (s.length < 2) return s;
  
  let start = 0;
  let maxLength = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const length = right - left + 1;
      if (length > maxLength) {
        maxLength = length;
        start = left;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);     // Odd length
    expandAroundCenter(i, i + 1); // Even length
  }
  
  return s.substring(start, start + maxLength);
}

/**
 * Group Anagrams
 * Time: O(n * k log k), Space: O(n)
 */
function groupAnagrams(strs) {
  const map = new Map();
  
  for (const str of strs) {
    const sorted = str.split('').sort().join('');
    
    if (!map.has(sorted)) {
      map.set(sorted, []);
    }
    map.get(sorted).push(str);
  }
  
  return Array.from(map.values());
}
```

---

## Hash Tables

### 5. LRU Cache

```javascript
/**
 * Least Recently Used Cache
 * Time: O(1) for get and put
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Add to end
    this.cache.set(key, value);
    
    // Remove oldest if over capacity
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}

// LRU Cache with Doubly Linked List (more explicit implementation)
class LRUCacheLinkedList {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    
    // Dummy head and tail
    this.head = { key: null, value: null };
    this.tail = { key: null, value: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
  
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  get(key) {
    if (!this.cache.has(key)) return -1;
    
    const node = this.cache.get(key);
    this.removeNode(node);
    this.addToHead(node);
    
    return node.value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this.removeNode(node);
      this.addToHead(node);
    } else {
      const node = { key, value };
      this.cache.set(key, node);
      this.addToHead(node);
      
      if (this.cache.size > this.capacity) {
        const lru = this.tail.prev;
        this.removeNode(lru);
        this.cache.delete(lru.key);
      }
    }
  }
}
```

### 6. Subarray Sum Equals K

```javascript
/**
 * Count subarrays with sum equal to k
 * Time: O(n), Space: O(n)
 */
function subarraySum(nums, k) {
  const prefixSumCount = new Map([[0, 1]]);
  let count = 0;
  let sum = 0;
  
  for (const num of nums) {
    sum += num;
    
    // If (sum - k) exists, we found subarrays ending here
    if (prefixSumCount.has(sum - k)) {
      count += prefixSumCount.get(sum - k);
    }
    
    prefixSumCount.set(sum, (prefixSumCount.get(sum) || 0) + 1);
  }
  
  return count;
}
```

---

## Linked Lists

### 7. Linked List Operations

```javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Reverse Linked List
 * Time: O(n), Space: O(1)
 */
function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}

// Recursive version
function reverseListRecursive(head) {
  if (!head || !head.next) return head;
  
  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;
  
  return newHead;
}

/**
 * Detect Cycle (Floyd's Algorithm)
 * Time: O(n), Space: O(1)
 */
function hasCycle(head) {
  if (!head || !head.next) return false;
  
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) return true;
  }
  
  return false;
}

// Find cycle start
function detectCycleStart(head) {
  if (!head || !head.next) return null;
  
  let slow = head;
  let fast = head;
  
  // Find meeting point
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) break;
  }
  
  if (!fast || !fast.next) return null;
  
  // Find cycle start
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  
  return slow;
}

/**
 * Merge Two Sorted Lists
 */
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }
  
  current.next = l1 || l2;
  
  return dummy.next;
}

/**
 * Remove Nth Node From End
 */
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;
  
  // Move fast n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }
  
  // Move both until fast reaches end
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  
  slow.next = slow.next.next;
  
  return dummy.next;
}
```

---

## Stacks & Queues

### 8. Stack Problems

```javascript
/**
 * Valid Parentheses
 */
function isValidParentheses(s) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of s) {
    if (char in pairs) {
      if (stack.pop() !== pairs[char]) return false;
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}

/**
 * Min Stack
 */
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }
  
  push(val) {
    this.stack.push(val);
    const min = this.minStack.length === 0 
      ? val 
      : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(min);
  }
  
  pop() {
    this.stack.pop();
    this.minStack.pop();
  }
  
  top() {
    return this.stack[this.stack.length - 1];
  }
  
  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

/**
 * Daily Temperatures (Monotonic Stack)
 * Time: O(n), Space: O(n)
 */
function dailyTemperatures(temperatures) {
  const result = new Array(temperatures.length).fill(0);
  const stack = []; // Store indices
  
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop();
      result[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  
  return result;
}

/**
 * Largest Rectangle in Histogram
 * Time: O(n), Space: O(n)
 */
function largestRectangleArea(heights) {
  const stack = [];
  let maxArea = 0;
  
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    
    stack.push(i);
  }
  
  return maxArea;
}
```

---

## Trees & Binary Search Trees

### 9. Binary Tree Traversals

```javascript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Inorder Traversal (Left -> Root -> Right)
 */
function inorderTraversal(root) {
  const result = [];
  
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}

// Iterative with Stack
function inorderIterative(root) {
  const result = [];
  const stack = [];
  let current = root;
  
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }
    
    current = stack.pop();
    result.push(current.val);
    current = current.right;
  }
  
  return result;
}

/**
 * Level Order Traversal (BFS)
 */
function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const level = [];
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}

/**
 * Maximum Depth
 */
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

/**
 * Validate BST
 */
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  
  if (root.val <= min || root.val >= max) return false;
  
  return isValidBST(root.left, min, root.val) && 
         isValidBST(root.right, root.val, max);
}

/**
 * Lowest Common Ancestor
 */
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  if (left && right) return root;
  return left || right;
}

/**
 * Serialize and Deserialize Binary Tree
 */
function serialize(root) {
  const result = [];
  
  function dfs(node) {
    if (!node) {
      result.push('null');
      return;
    }
    result.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }
  
  dfs(root);
  return result.join(',');
}

function deserialize(data) {
  const nodes = data.split(',');
  let index = 0;
  
  function dfs() {
    if (nodes[index] === 'null') {
      index++;
      return null;
    }
    
    const node = new TreeNode(parseInt(nodes[index]));
    index++;
    node.left = dfs();
    node.right = dfs();
    return node;
  }
  
  return dfs();
}
```

---

## Graphs

### 10. Graph Algorithms

```javascript
/**
 * BFS - Shortest Path in Unweighted Graph
 */
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const distances = { [start]: 0 };
  
  while (queue.length) {
    const node = queue.shift();
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances[neighbor] = distances[node] + 1;
        queue.push(neighbor);
      }
    }
  }
  
  return distances;
}

/**
 * DFS - All Paths
 */
function allPaths(graph, start, end) {
  const paths = [];
  
  function dfs(node, path) {
    if (node === end) {
      paths.push([...path]);
      return;
    }
    
    for (const neighbor of graph[node]) {
      if (!path.includes(neighbor)) {
        path.push(neighbor);
        dfs(neighbor, path);
        path.pop();
      }
    }
  }
  
  dfs(start, [start]);
  return paths;
}

/**
 * Detect Cycle in Directed Graph
 */
function hasCycleDirected(numNodes, edges) {
  const graph = Array.from({ length: numNodes }, () => []);
  
  for (const [from, to] of edges) {
    graph[from].push(to);
  }
  
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const colors = new Array(numNodes).fill(WHITE);
  
  function dfs(node) {
    colors[node] = GRAY;
    
    for (const neighbor of graph[node]) {
      if (colors[neighbor] === GRAY) return true; // Back edge = cycle
      if (colors[neighbor] === WHITE && dfs(neighbor)) return true;
    }
    
    colors[node] = BLACK;
    return false;
  }
  
  for (let i = 0; i < numNodes; i++) {
    if (colors[i] === WHITE && dfs(i)) return true;
  }
  
  return false;
}

/**
 * Topological Sort (Kahn's Algorithm)
 */
function topologicalSort(numNodes, edges) {
  const graph = Array.from({ length: numNodes }, () => []);
  const inDegree = new Array(numNodes).fill(0);
  
  for (const [from, to] of edges) {
    graph[from].push(to);
    inDegree[to]++;
  }
  
  const queue = [];
  for (let i = 0; i < numNodes; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  const result = [];
  
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  
  return result.length === numNodes ? result : []; // Empty if cycle exists
}

/**
 * Number of Islands
 */
function numIslands(grid) {
  if (!grid.length) return 0;
  
  let count = 0;
  const rows = grid.length;
  const cols = grid[0].length;
  
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }
    
    grid[r][c] = '0'; // Mark visited
    
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

/**
 * Dijkstra's Algorithm
 */
function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const pq = new MinPriorityQueue();
  
  // Initialize distances
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  
  pq.enqueue(start, 0);
  
  while (!pq.isEmpty()) {
    const { element: node } = pq.dequeue();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (const [neighbor, weight] of graph[node]) {
      const newDist = distances[node] + weight;
      
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  
  return distances;
}
```

---

## Dynamic Programming

### 11. Classic DP Problems

```javascript
/**
 * Climbing Stairs
 * Time: O(n), Space: O(1)
 */
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev2 = 1, prev1 = 2;
  
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}

/**
 * House Robber
 * Time: O(n), Space: O(1)
 */
function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  
  let prev2 = 0, prev1 = 0;
  
  for (const num of nums) {
    const current = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
}

/**
 * Longest Increasing Subsequence
 * Time: O(n log n)
 */
function lengthOfLIS(nums) {
  const tails = [];
  
  for (const num of nums) {
    let left = 0, right = tails.length;
    
    // Binary search for insertion position
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    if (left === tails.length) {
      tails.push(num);
    } else {
      tails[left] = num;
    }
  }
  
  return tails.length;
}

/**
 * Coin Change
 * Time: O(amount * coins.length), Space: O(amount)
 */
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * Longest Common Subsequence
 * Time: O(m * n), Space: O(n)
 */
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  let prev = new Array(n + 1).fill(0);
  
  for (let i = 1; i <= m; i++) {
    const curr = new Array(n + 1).fill(0);
    
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    
    prev = curr;
  }
  
  return prev[n];
}

/**
 * 0/1 Knapsack
 */
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < n; i++) {
    // Traverse backwards to avoid using same item twice
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

/**
 * Edit Distance
 */
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  
  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Delete
          dp[i][j - 1],     // Insert
          dp[i - 1][j - 1]  // Replace
        );
      }
    }
  }
  
  return dp[m][n];
}
```

---

## Sorting & Searching

### 12. Sorting Algorithms

```javascript
/**
 * Merge Sort
 * Time: O(n log n), Space: O(n)
 */
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 * Quick Sort
 * Time: O(n log n) average, O(n²) worst
 */
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

/**
 * Binary Search
 */
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}

// Find first occurrence
function findFirst(arr, target) {
  let left = 0, right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // Keep searching left
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}

/**
 * Search in Rotated Sorted Array
 */
function searchRotated(nums, target) {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    
    // Left half is sorted
    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}
```

---

## Sliding Window & Two Pointers

### 13. Window Techniques

```javascript
/**
 * Maximum Sum Subarray of Size K
 */
function maxSumSubarray(arr, k) {
  let maxSum = 0;
  let windowSum = 0;
  
  // Initial window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum + arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}

/**
 * Longest Substring Without Repeating Characters
 * Time: O(n), Space: O(min(m, n))
 */
function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLength = 0;
  let start = 0;
  
  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    
    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }
    
    seen.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }
  
  return maxLength;
}

/**
 * Minimum Window Substring
 * Time: O(n), Space: O(m)
 */
function minWindow(s, t) {
  const need = new Map();
  const have = new Map();
  
  for (const char of t) {
    need.set(char, (need.get(char) || 0) + 1);
  }
  
  let needCount = need.size;
  let haveCount = 0;
  let minLen = Infinity;
  let result = '';
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    have.set(char, (have.get(char) || 0) + 1);
    
    if (need.has(char) && have.get(char) === need.get(char)) {
      haveCount++;
    }
    
    while (haveCount === needCount) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        result = s.substring(left, right + 1);
      }
      
      const leftChar = s[left];
      have.set(leftChar, have.get(leftChar) - 1);
      
      if (need.has(leftChar) && have.get(leftChar) < need.get(leftChar)) {
        haveCount--;
      }
      
      left++;
    }
  }
  
  return result;
}

/**
 * Container With Most Water
 * Time: O(n), Space: O(1)
 */
function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;
  
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    const width = right - left;
    maxWater = Math.max(maxWater, h * width);
    
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  
  return maxWater;
}

/**
 * Trapping Rain Water
 * Time: O(n), Space: O(1)
 */
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  
  return water;
}
```

---

## Common Patterns

### 14. Important Problem-Solving Patterns

```javascript
/**
 * Pattern 1: Fast & Slow Pointers
 * - Cycle detection
 * - Middle of linked list
 * - Happy number
 */
function findMiddle(head) {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return slow;
}

/**
 * Pattern 2: Merge Intervals
 */
// Already covered above

/**
 * Pattern 3: Cyclic Sort
 * For arrays with numbers in range [1, n]
 */
function findMissingNumber(nums) {
  let i = 0;
  
  // Place each number at its correct index
  while (i < nums.length) {
    const j = nums[i] - 1;
    if (nums[i] > 0 && nums[i] <= nums.length && nums[i] !== nums[j]) {
      [nums[i], nums[j]] = [nums[j], nums[i]];
    } else {
      i++;
    }
  }
  
  // Find missing
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  
  return nums.length + 1;
}

/**
 * Pattern 4: In-place Reversal
 */
function reverseSubList(head, p, q) {
  if (p === q) return head;
  
  let current = head, prev = null;
  
  // Move to position p-1
  for (let i = 0; current && i < p - 1; i++) {
    prev = current;
    current = current.next;
  }
  
  const lastNodeOfFirstPart = prev;
  const lastNodeOfSubList = current;
  
  // Reverse from p to q
  let next = null;
  for (let i = 0; current && i < q - p + 1; i++) {
    next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  // Connect parts
  if (lastNodeOfFirstPart) {
    lastNodeOfFirstPart.next = prev;
  } else {
    head = prev;
  }
  
  lastNodeOfSubList.next = current;
  
  return head;
}

/**
 * Pattern 5: Top K Elements (Heap)
 */
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }
  
  // Bucket sort approach - O(n)
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  
  for (const [num, count] of freq) {
    buckets[count].push(num);
  }
  
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }
  
  return result.slice(0, k);
}

/**
 * Pattern 6: Backtracking
 */
function permute(nums) {
  const result = [];
  
  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      path.push(nums[i]);
      used[i] = true;
      
      backtrack(path, used);
      
      path.pop();
      used[i] = false;
    }
  }
  
  backtrack([], new Array(nums.length).fill(false));
  return result;
}

function subsets(nums) {
  const result = [];
  
  function backtrack(start, current) {
    result.push([...current]);
    
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

/**
 * Pattern 7: Union Find
 */
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;
  }
  
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    
    if (px === py) return false;
    
    // Union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    
    this.count--;
    return true;
  }
  
  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

---

## Summary

These DSA questions cover:

1. ✅ **Arrays & Strings** - Two Sum, Kadane's, Merge Intervals
2. ✅ **Hash Tables** - LRU Cache, Prefix Sum
3. ✅ **Linked Lists** - Reverse, Cycle Detection, Merge
4. ✅ **Stacks & Queues** - Monotonic Stack, Min Stack
5. ✅ **Trees** - Traversals, BST, LCA, Serialization
6. ✅ **Graphs** - BFS, DFS, Topological Sort, Dijkstra
7. ✅ **Dynamic Programming** - Classic DP problems
8. ✅ **Sorting & Searching** - Merge Sort, Quick Sort, Binary Search
9. ✅ **Sliding Window** - Substring, Container, Rain Water
10. ✅ **Common Patterns** - Fast/Slow, Backtracking, Union Find

**Time Complexities to Remember**:
- Array access: O(1)
- Hash table operations: O(1) average
- Binary search: O(log n)
- Sorting: O(n log n)
- DFS/BFS: O(V + E)
- DP: Usually O(n²) or O(n * m)

**Interview Tips**:
- Always clarify the problem
- Start with brute force, then optimize
- Think about edge cases
- Communicate your thought process
- Practice writing clean code

मालिक, master these patterns and you'll solve most coding interview problems! 🚀
