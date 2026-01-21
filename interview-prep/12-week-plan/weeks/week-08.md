# Week 8: Backtracking & Recursion

**Time Commitment:** 8-9 hours  
**Focus:** Backtracking algorithms, recursion patterns, and Node.js streaming

---

## Learning Objectives

By the end of this week, you should be able to:
- Master backtracking template
- Solve recursive problems confidently
- Understand when to use backtracking
- Understand Node.js streaming patterns

---

## Day-by-Day Breakdown

### Day 1: Recursion Fundamentals (2 hours)
**Study (1 hour):**
- Review recursion basics:
  - Base case
  - Recursive case
  - Call stack
- Understand recursion vs iteration

**Practice (1 hour):**
- Practice recursive thinking:
  ```javascript
  // Factorial
  function factorial(n) {
    if (n <= 1) return 1; // Base case
    return n * factorial(n - 1); // Recursive case
  }
  
  // Fibonacci
  function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  }
  
  // Power
  function power(base, exp) {
    if (exp === 0) return 1;
    return base * power(base, exp - 1);
  }
  ```

### Day 2: Backtracking Template (2 hours)
**Study (1 hour):**
- Read [Coding Patterns: Backtracking](../../coding/patterns/patterns-cheatsheet.md#5-backtracking)
- Understand backtracking template:
  ```javascript
  function backtrack(candidates, path, result) {
    // Base case
    if (/* condition */) {
      result.push([...path]); // Make a copy!
      return;
    }
    
    // Try all candidates
    for (const candidate of candidates) {
      // Make choice
      path.push(candidate);
      
      // Recurse
      backtrack(candidates, path, result);
      
      // Undo choice (backtrack)
      path.pop();
    }
  }
  ```

**Practice (1 hour):**
- LeetCode Medium: [Subsets](https://leetcode.com/problems/subsets/)
- Practice the template with this problem

### Day 3: Backtracking Problems (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Permutations](https://leetcode.com/problems/permutations/)
- LeetCode Medium: [Combination Sum](https://leetcode.com/problems/combination-sum/)
- Focus on:
  - When to use a copy of path
  - How to avoid duplicates
  - Pruning invalid paths early

### Day 4: Advanced Backtracking (2 hours)
**Practice (2 hours):**
- LeetCode Hard: [N-Queens](https://leetcode.com/problems/n-queens/)
- LeetCode Medium: [Word Search](https://leetcode.com/problems/word-search/)
- Practice explaining the backtracking process

### Day 5: Node.js Streaming (1 hour)
**Study (1 hour):**
- Read [Backend Advanced: Streams](../../coding/questions/backend-advanced-questions.md#streams--buffers)
- Review [Node.js Streaming Patterns](../../../../design-patterns/nodejs/04-streaming-patterns.md)
- Understand:
  - Readable, Writable, Transform streams
  - Backpressure handling
  - When to use streams
- Practice examples:
  ```javascript
  const fs = require('fs');
  const { Transform } = require('stream');
  
  // Read stream
  const readStream = fs.createReadStream('input.txt');
  
  // Transform stream
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });
  
  // Write stream
  const writeStream = fs.createWriteStream('output.txt');
  
  // Pipe
  readStream.pipe(transform).pipe(writeStream);
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all backtracking problems
- Understand when to use backtracking vs DP

**Practice (1.5 hours):**
- Re-solve Permutations and Subsets
- LeetCode Medium: [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
- Practice timing: aim for 30-35 minutes per Medium problem

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you write the backtracking template?
- Can you identify when to use backtracking?
- Can you explain recursion clearly?

**Practice:**
- Solve one new backtracking problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Medium)
1. [Subsets](https://leetcode.com/problems/subsets/) - Classic backtracking
2. [Permutations](https://leetcode.com/problems/permutations/) - Backtracking
3. [Combination Sum](https://leetcode.com/problems/combination-sum/) - Backtracking with constraints

### Additional Practice
1. [N-Queens](https://leetcode.com/problems/n-queens/) - Advanced backtracking (Hard)
2. [Word Search](https://leetcode.com/problems/word-search/) - 2D backtracking
3. [Letter Combinations](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) - Backtracking

---

## Study Materials

### Internal Resources
- [Coding Patterns: Backtracking](../../coding/patterns/patterns-cheatsheet.md#5-backtracking)
- [Backend Advanced: Streams](../../coding/questions/backend-advanced-questions.md#streams--buffers)
- [Node.js Streaming Patterns](../../../../design-patterns/nodejs/04-streaming-patterns.md)

### External Resources
- LeetCode Backtracking: https://leetcode.com/tag/backtracking/
- NeetCode Backtracking: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Backtracking Template:**
   - Make choice
   - Recurse
   - Undo choice
   - Base case adds to result

2. **When to Use Backtracking:**
   - Generate all combinations/permutations
   - Constraint satisfaction
   - Exploring all possibilities

3. **Avoiding Duplicates:**
   - Sort candidates first
   - Skip duplicates in loop
   - Use set to track used

---

## Tips

- **Memorize template:** Know the backtracking template by heart
- **Make copies:** Always copy path before adding to result
- **Prune early:** Skip invalid paths as soon as possible
- **Practice visualization:** Draw the decision tree

---

## Weekly Checklist

- [ ] Mastered backtracking template
- [ ] Solved at least 5-6 backtracking problems
- [ ] Can implement recursive solutions
- [ ] Reviewed Node.js streaming patterns
- [ ] Can explain backtracking clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Milestone: End of Intermediate Phase

Congratulations! You've completed the intermediate phase (Weeks 5-8). You should now be comfortable with:
- Dynamic Programming basics
- Advanced algorithms (sliding window, binary search)
- Backtracking and recursion
- Node.js backend concepts

**Next:** Weeks 9-12 will focus on advanced topics and system design.

---

## Next Week Preview

Week 9 will cover Advanced DSA Patterns. Make sure you're comfortable with:
- Backtracking template
- Recursive thinking
- Basic Node.js concepts
