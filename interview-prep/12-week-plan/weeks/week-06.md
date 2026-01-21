# Week 6: Sliding Window & Two Pointers Advanced

**Time Commitment:** 7-8 hours  
**Focus:** Advanced sliding window techniques and Node.js async patterns

---

## Learning Objectives

By the end of this week, you should be able to:
- Master fixed and variable sliding window patterns
- Solve complex two-pointer problems
- Understand Node.js async patterns and concurrency

---

## Day-by-Day Breakdown

### Day 1: Fixed Sliding Window (1.5 hours)
**Study (30 min):**
- Review [Coding Patterns: Sliding Window](../../coding/patterns/patterns-cheatsheet.md#2-sliding-window)
- Understand fixed window template

**Practice (1 hour):**
- LeetCode Easy: [Maximum Average Subarray](https://leetcode.com/problems/maximum-average-subarray-i/)
- LeetCode Medium: [Maximum Sum Subarray of Size K](https://leetcode.com/problems/maximum-sum-subarray-of-size-k/)
- Practice the template:
  ```javascript
  function fixedWindow(arr, k) {
    let windowSum = 0;
    let maxSum = -Infinity;
    
    // Initialize window
    for (let i = 0; i < k; i++) {
      windowSum += arr[i];
    }
    maxSum = windowSum;
    
    // Slide window
    for (let i = k; i < arr.length; i++) {
      windowSum = windowSum - arr[i - k] + arr[i];
      maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
  }
  ```

### Day 2: Variable Sliding Window (2 hours)
**Study (30 min):**
- Understand variable window (expand/contract)
- Learn when to use variable vs fixed window

**Practice (1.5 hours):**
- LeetCode Medium: [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- LeetCode Hard: [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- Practice the template:
  ```javascript
  function variableWindow(s) {
    let left = 0;
    let right = 0;
    const window = new Map();
    let result = 0;
    
    while (right < s.length) {
      // Expand window
      window.set(s[right], (window.get(s[right]) || 0) + 1);
      
      // Contract window if needed
      while (/* condition */) {
        window.set(s[left], window.get(s[left]) - 1);
        if (window.get(s[left]) === 0) window.delete(s[left]);
        left++;
      }
      
      // Update result
      result = Math.max(result, right - left + 1);
      right++;
    }
    
    return result;
  }
  ```

### Day 3: Two Pointers Advanced (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- LeetCode Hard: [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
- LeetCode Medium: [3Sum Closest](https://leetcode.com/problems/3sum-closest/)
- Focus on identifying when to move which pointer

### Day 4: Sliding Window Problems (1.5 hours)
**Practice (1.5 hours):**
- LeetCode Medium: [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/)
- LeetCode Medium: [Permutation in String](https://leetcode.com/problems/permutation-in-string/)
- Practice explaining the approach clearly

### Day 5: Node.js Async Patterns (1 hour)
**Study (1 hour):**
- Read [Node.js Async Patterns](../../../../design-patterns/nodejs/02-async-patterns.md)
- Understand:
  - Promise.all vs Promise.allSettled
  - Concurrency control (semaphore, promise pool)
  - Error handling patterns
- Practice examples:
  ```javascript
  // Promise.all - all must succeed
  const results = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  
  // Promise.allSettled - get all results
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  
  // Concurrency control
  async function processWithLimit(items, limit) {
    const results = [];
    for (let i = 0; i < items.length; i += limit) {
      const batch = items.slice(i, i + limit);
      const batchResults = await Promise.all(batch.map(process));
      results.push(...batchResults);
    }
    return results;
  }
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all sliding window problems
- Understand when to use fixed vs variable window

**Practice (1.5 hours):**
- Re-solve Longest Substring Without Repeating
- LeetCode Medium: [Fruit Into Baskets](https://leetcode.com/problems/fruit-into-baskets/)
- Practice timing: aim for 25-30 minutes per Medium problem

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement sliding window templates?
- Can you identify when to use two pointers?
- Can you explain Node.js async patterns?

**Practice:**
- Solve one new sliding window problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Medium)
1. [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) - Variable window
2. [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) - Two pointers
3. [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) - Variable window (Hard)

### Additional Practice
1. [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) - Two pointers (Hard)
2. [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) - Variable window

---

## Study Materials

### Internal Resources
- [Coding Patterns: Sliding Window](../../coding/patterns/patterns-cheatsheet.md#2-sliding-window)
- [DSA Sliding Window](../../coding/dsa/dsa-interview-questions.md#sliding-window--two-pointers)
- [Node.js Async Patterns](../../../../design-patterns/nodejs/02-async-patterns.md)

### External Resources
- LeetCode Sliding Window: https://leetcode.com/tag/sliding-window/
- NeetCode Sliding Window: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Fixed Window:**
   - Window size is constant
   - Calculate once, then slide
   - Examples: Maximum sum of subarray of size k

2. **Variable Window:**
   - Window size changes
   - Expand until condition met, then contract
   - Examples: Longest substring, minimum window

3. **Two Pointers:**
   - Sorted arrays
   - Move pointers based on condition
   - Examples: Two sum, container with water

---

## Tips

- **Memorize templates:** Know fixed and variable window templates
- **Practice timing:** Medium problems in 25-30 minutes
- **Explain clearly:** Practice explaining your approach
- **Handle edge cases:** Empty strings, single character, etc.

---

## Weekly Checklist

- [ ] Mastered fixed sliding window template
- [ ] Mastered variable sliding window template
- [ ] Solved at least 5-6 sliding window/two pointer problems
- [ ] Reviewed Node.js async patterns
- [ ] Can explain solutions clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 7 will cover Sorting & Searching. Make sure you're comfortable with:
- Sliding window patterns
- Two pointer techniques
- Async JavaScript concepts
