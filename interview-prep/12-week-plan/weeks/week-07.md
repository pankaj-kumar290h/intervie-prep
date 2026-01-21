# Week 7: Sorting & Searching

**Time Commitment:** 7-8 hours  
**Focus:** Sorting algorithms, binary search, and Node.js middleware

---

## Learning Objectives

By the end of this week, you should be able to:
- Implement common sorting algorithms
- Master binary search variations
- Understand time/space complexity of sorting
- Understand Express.js middleware patterns

---

## Day-by-Day Breakdown

### Day 1: Sorting Algorithms (2 hours)
**Study (1 hour):**
- Read [DSA Sorting & Searching section](../../coding/dsa/dsa-interview-questions.md#sorting--searching)
- Understand time/space complexity:
  - Quick Sort: O(n log n) avg, O(n²) worst
  - Merge Sort: O(n log n) always
  - Heap Sort: O(n log n)
  - Bubble Sort: O(n²)

**Practice (1 hour):**
- Implement Quick Sort:
  ```javascript
  function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = [];
    const middle = [];
    const right = [];
    
    for (const num of arr) {
      if (num < pivot) left.push(num);
      else if (num > pivot) right.push(num);
      else middle.push(num);
    }
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
  }
  ```

### Day 2: Merge Sort & Binary Search (2 hours)
**Practice (1 hour):**
- Implement Merge Sort:
  ```javascript
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
      if (left[i] < right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
  ```

**Practice (1 hour):**
- Implement Binary Search:
  ```javascript
  function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      if (arr[mid] === target) return mid;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  }
  ```

### Day 3: Binary Search Variations (2 hours)
**Practice (2 hours):**
- LeetCode Medium: [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- LeetCode Medium: [Find Peak Element](https://leetcode.com/problems/find-peak-element/)
- LeetCode Medium: [Search for a Range](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)
- Practice different binary search patterns:
  - Finding first occurrence
  - Finding last occurrence
  - Finding in rotated array

### Day 4: Sorting Problems (1.5 hours)
**Practice (1.5 hours):**
- LeetCode Medium: [Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- LeetCode Medium: [Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- Understand when sorting helps solve problems

### Day 5: Node.js Middleware (1 hour)
**Study (1 hour):**
- Read [Node.js Middleware Patterns](../../../../design-patterns/nodejs/03-middleware-patterns.md)
- Understand Express.js middleware:
  - Request/Response cycle
  - Middleware order matters
  - Error handling middleware
- Review Express.js basics
- Practice examples:
  ```javascript
  const express = require('express');
  const app = express();
  
  // Middleware
  app.use((req, res, next) => {
    console.log('Request:', req.method, req.path);
    next();
  });
  
  // Route handler
  app.get('/users', (req, res) => {
    res.json({ users: [] });
  });
  
  // Error handling
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
  });
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review sorting algorithms and their complexities
- Review binary search variations

**Practice (1.5 hours):**
- Re-solve Search in Rotated Sorted Array
- LeetCode Medium: [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)
- Practice implementing sorting algorithms from memory

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement Quick Sort and Merge Sort?
- Can you write binary search variations?
- Can you explain middleware in Express?

**Practice:**
- Solve one new binary search problem
- Review weak areas

---

## Key Problems to Master

### Must Solve (Medium)
1. [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) - Binary search variant
2. [Find Peak Element](https://leetcode.com/problems/find-peak-element/) - Binary search
3. [Kth Largest Element](https://leetcode.com/problems/kth-largest-element-in-an-array/) - Quick select

### Additional Practice
1. [Merge Intervals](https://leetcode.com/problems/merge-intervals/) - Sorting + merging
2. [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) - Binary search

---

## Study Materials

### Internal Resources
- [DSA Sorting & Searching](../../coding/dsa/dsa-interview-questions.md#sorting--searching)
- [Node.js Middleware Patterns](../../../../design-patterns/nodejs/03-middleware-patterns.md)

### External Resources
- LeetCode Binary Search: https://leetcode.com/tag/binary-search/
- NeetCode Sorting: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Binary Search Template:**
   - Sorted array
   - O(log n) search
   - Left/right pointers

2. **Sorting Before Solving:**
   - Many problems become easier after sorting
   - Two sum in sorted array
   - Merge intervals

3. **Quick Select:**
   - Finding kth element
   - O(n) average time
   - Based on Quick Sort

---

## Tips

- **Memorize binary search:** Know the template by heart
- **Understand complexities:** Know when to use which sort
- **Practice variations:** Binary search has many variations
- **Test edge cases:** Empty array, single element, duplicates

---

## Weekly Checklist

- [ ] Implemented Quick Sort and Merge Sort
- [ ] Can implement binary search and variations
- [ ] Solved at least 5-6 sorting/searching problems
- [ ] Reviewed Express.js middleware
- [ ] Can explain algorithms clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 8 will cover Backtracking & Recursion. Make sure you're comfortable with:
- Sorting algorithms
- Binary search
- Recursive thinking
