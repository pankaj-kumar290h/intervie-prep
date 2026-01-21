# Week 5: Dynamic Programming Basics

**Time Commitment:** 8-9 hours  
**Focus:** Introduction to DP, memoization, and Node.js module patterns

---

## Learning Objectives

By the end of this week, you should be able to:
- Understand DP concepts: memoization vs tabulation
- Identify DP problems (overlapping subproblems, optimal substructure)
- Solve basic DP problems
- Understand Node.js module system

---

## Day-by-Day Breakdown

### Day 1: DP Fundamentals (2 hours)
**Study (1 hour):**
- Read [DSA Dynamic Programming section](../../coding/dsa/dsa-interview-questions.md#dynamic-programming)
- Understand key concepts:
  - Overlapping subproblems
  - Optimal substructure
  - Memoization (top-down)
  - Tabulation (bottom-up)

**Practice (1 hour):**
- Start with Fibonacci (classic DP example):
  ```javascript
  // Naive recursive (slow)
  function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  }
  
  // Memoization (top-down)
  function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
  }
  
  // Tabulation (bottom-up)
  function fibTab(n) {
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
  }
  ```

### Day 2: 1D DP Problems (2 hours)
**Practice (2 hours):**
- LeetCode Easy: [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
- LeetCode Easy: [House Robber](https://leetcode.com/problems/house-robber/)
- Practice both memoization and tabulation approaches
- Focus on identifying the recurrence relation

### Day 3: 1D DP Advanced (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Coin Change](https://leetcode.com/problems/coin-change/)
- LeetCode Medium: [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)
- Understand the difference between:
  - Counting problems (how many ways)
  - Optimization problems (min/max)

### Day 4: 2D DP Introduction (2 hours)
**Study (30 min):**
- Understand 2D DP: grid problems, two sequences
- Learn to build DP table

**Practice (1.5 hours):**
- LeetCode Medium: [Unique Paths](https://leetcode.com/problems/unique-paths/)
- LeetCode Medium: [Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/)
- Practice drawing DP tables

### Day 5: Node.js Module Patterns (1 hour)
**Study (1 hour):**
- Read [Node.js Module Patterns](../../../../design-patterns/nodejs/01-module-patterns.md)
- Understand:
  - CommonJS (require/module.exports)
  - ES Modules (import/export)
  - When to use each
- Practice examples:
  ```javascript
  // CommonJS
  // math.js
  module.exports = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
  };
  
  // app.js
  const math = require('./math');
  
  // ES Modules
  // math.mjs
  export const add = (a, b) => a + b;
  
  // app.mjs
  import { add } from './math.mjs';
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all DP problems from this week
- Identify DP patterns: 1D vs 2D

**Practice (1.5 hours):**
- Re-solve 2-3 problems using different approaches
- LeetCode Medium: [Decode Ways](https://leetcode.com/problems/decode-ways/)
- Practice explaining DP solutions clearly

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you identify when a problem is DP?
- Can you write recurrence relations?
- Can you explain memoization vs tabulation?

**Practice:**
- Solve one new DP problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Easy)
1. [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) - Classic 1D DP
2. [House Robber](https://leetcode.com/problems/house-robber/) - 1D DP with constraints

### Must Solve (Medium)
1. [Coin Change](https://leetcode.com/problems/coin-change/) - Unbounded knapsack
2. [Unique Paths](https://leetcode.com/problems/unique-paths/) - 2D DP
3. [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) - 1D DP

---

## Study Materials

### Internal Resources
- [DSA Dynamic Programming](../../coding/dsa/dsa-interview-questions.md#dynamic-programming)
- [Node.js Module Patterns](../../../../design-patterns/nodejs/01-module-patterns.md)

### External Resources
- LeetCode DP Tag: https://leetcode.com/tag/dynamic-programming/
- NeetCode DP: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **1D DP Patterns:**
   - Linear problems
   - State depends on previous states
   - Examples: Fibonacci, Climbing Stairs

2. **2D DP Patterns:**
   - Grid problems
   - Two sequences (strings, arrays)
   - Examples: Unique Paths, Edit Distance

3. **DP Problem Identification:**
   - "Count ways" or "Find minimum/maximum"
   - Overlapping subproblems
   - Optimal substructure

---

## Tips

- **Start with brute force:** Then optimize with DP
- **Draw DP table:** Visualize the solution
- **Practice recurrence:** Master writing recurrence relations
- **Space optimization:** Learn to optimize space from O(n²) to O(n)

---

## Weekly Checklist

- [ ] Understand memoization vs tabulation
- [ ] Solved at least 5-6 DP problems
- [ ] Can identify DP problems
- [ ] Reviewed Node.js module patterns
- [ ] Can explain DP solutions clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 6 will cover Sliding Window & Two Pointers Advanced. Make sure you're comfortable with:
- Basic DP concepts
- Recurrence relations
- Node.js module system
