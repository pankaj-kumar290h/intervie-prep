# Week 1: Arrays & Hash Tables

**Time Commitment:** 7-8 hours  
**Focus:** Foundation building with arrays, hash tables, and core JavaScript

---

## Learning Objectives

By the end of this week, you should be able to:
- Understand array manipulation techniques
- Implement and use hash tables effectively
- Solve array problems using two-pointer technique
- Explain closures, scope, and `this` binding in JavaScript

---

## Day-by-Day Breakdown

### Day 1: Arrays Fundamentals (1.5 hours)
**Study (45 min):**
- Read [DSA Arrays & Strings section](../javaScript/dsa-interview-questions.md#arrays--strings)
- Focus on: Two Sum, Three Sum, Array manipulation basics
- Review time/space complexity for array operations

**Practice (45 min):**
- LeetCode Easy: [Two Sum](https://leetcode.com/problems/two-sum/)
- LeetCode Easy: [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)
- Implement solution from scratch, explain approach

### Day 2: Hash Tables (1.5 hours)
**Study (30 min):**
- Understand hash table concepts: collision handling, load factor
- Review JavaScript Map and Set data structures

**Practice (1 hour):**
- Implement a simple HashTable class from scratch:
  ```javascript
  class HashTable {
    constructor(size = 53) {
      this.keyMap = new Array(size);
    }
    
    _hash(key) {
      // Implement hash function
    }
    
    set(key, value) {
      // Implement set with collision handling
    }
    
    get(key) {
      // Implement get
    }
  }
  ```
- LeetCode Easy: [Group Anagrams](https://leetcode.com/problems/group-anagrams/)

### Day 3: Two Pointers Technique (1.5 hours)
**Study (30 min):**
- Read [Coding Patterns: Two Pointers](../interview-prep/coding-patterns-cheatsheet.md#1-two-pointers)
- Understand when to use two pointers

**Practice (1 hour):**
- LeetCode Medium: [3Sum](https://leetcode.com/problems/3sum/)
- LeetCode Medium: [Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- Practice explaining your approach out loud

### Day 4: Array Manipulation (1.5 hours)
**Practice (1.5 hours):**
- LeetCode Medium: [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
- LeetCode Easy: [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)
- Focus on optimizing space complexity

### Day 5: Core JavaScript - Closures & Scope (1 hour)
**Study (1 hour):**
- Review closures: what they are, how they work
- Understand scope: global, function, block scope
- Study `this` binding: implicit, explicit, arrow functions
- Read: [Frontend Advanced: Memory Management](../javaScript/frontend-advanced-questions.md#memory-management--leaks)
- Practice examples:
  ```javascript
  // Closure example
  function outer() {
    let count = 0;
    return function inner() {
      count++;
      return count;
    };
  }
  
  // this binding examples
  const obj = {
    name: 'Test',
    regular: function() { console.log(this.name); },
    arrow: () => { console.log(this.name); }
  };
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all problems from this week
- Identify patterns: when to use hash table vs two pointers

**Practice (1.5 hours):**
- Re-solve 2-3 problems from earlier in the week
- LeetCode Medium: [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)
- Time yourself: aim for 20-25 minutes per problem

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you explain hash table collision handling?
- Can you identify when to use two pointers?
- Can you explain closures and `this` binding?

**Practice:**
- Solve one new problem without looking at solutions
- Review weak areas from the week

---

## Key Problems to Master

### Must Solve (Easy)
1. [Two Sum](https://leetcode.com/problems/two-sum/) - Hash table approach
2. [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) - Multiple approaches
3. [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) - Single pass

### Must Solve (Medium)
1. [3Sum](https://leetcode.com/problems/3sum/) - Two pointers + sorting
2. [Group Anagrams](https://leetcode.com/problems/group-anagrams/) - Hash table grouping
3. [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) - Space optimization

---

## Study Materials

### Internal Resources
- [DSA Arrays & Strings](../../coding/dsa/dsa-interview-questions.md#arrays--strings)
- [Coding Patterns: Two Pointers](../../coding/patterns/patterns-cheatsheet.md#1-two-pointers)
- [Frontend Advanced: Memory Management](../../coding/questions/frontend-advanced-questions.md#memory-management--leaks)

### External Resources
- LeetCode Array Tag: https://leetcode.com/tag/array/
- NeetCode Array Problems: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Hash Table for Lookups:**
   - When you need O(1) lookup time
   - Counting frequencies
   - Grouping elements

2. **Two Pointers:**
   - Sorted arrays
   - Finding pairs
   - In-place operations

3. **Prefix/Postfix Arrays:**
   - Product of Array Except Self
   - Running sums

---

## Tips

- **Start with brute force:** Don't optimize immediately, get it working first
- **Explain out loud:** Practice explaining your approach as you code
- **Time yourself:** Aim for 20-25 min for Easy, 30-40 min for Medium
- **Review solutions:** After solving, look at optimal solutions to learn patterns

---

## Weekly Checklist

- [ ] Completed all study materials
- [ ] Solved at least 6 problems (3 Easy, 3 Medium)
- [ ] Implemented HashTable from scratch
- [ ] Reviewed closures, scope, and `this` binding
- [ ] Can explain solutions clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 2 will cover Linked Lists and Stacks/Queues. Make sure you're comfortable with:
- Array manipulation
- Hash table operations
- Basic problem-solving patterns
