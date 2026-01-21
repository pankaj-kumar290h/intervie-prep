# Week 2: Linked Lists & Stacks/Queues

**Time Commitment:** 7-8 hours  
**Focus:** Understanding linked data structures and core JavaScript prototypes

---

## Learning Objectives

By the end of this week, you should be able to:
- Implement LinkedList, Stack, and Queue from scratch
- Understand pointer manipulation in linked lists
- Solve common linked list problems
- Explain JavaScript prototypes and inheritance

---

## Day-by-Day Breakdown

### Day 1: Linked List Fundamentals (1.5 hours)
**Study (45 min):**
- Read [DSA Linked Lists section](../../coding/dsa/dsa-interview-questions.md#linked-lists)
- Understand: singly vs doubly linked lists
- Learn pointer manipulation basics

**Practice (45 min):**
- Implement a basic LinkedList class:
  ```javascript
  class ListNode {
    constructor(val, next = null) {
      this.val = val;
      this.next = next;
    }
  }
  
  class LinkedList {
    constructor() {
      this.head = null;
      this.size = 0;
    }
    
    addAtHead(val) { }
    addAtTail(val) { }
    get(index) { }
    deleteAtIndex(index) { }
  }
  ```

### Day 2: Linked List Problems (1.5 hours)
**Practice (1.5 hours):**
- LeetCode Easy: [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)
- LeetCode Easy: [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- Focus on iterative and recursive approaches
- Practice drawing diagrams to visualize pointer movement

### Day 3: Stacks & Queues (1.5 hours)
**Study (30 min):**
- Read [DSA Stacks & Queues section](../../coding/dsa/dsa-interview-questions.md#stacks--queues)
- Understand: LIFO (Stack) vs FIFO (Queue)
- Learn use cases for each

**Practice (1 hour):**
- Implement Stack class:
  ```javascript
  class Stack {
    constructor() {
      this.items = [];
    }
    
    push(item) { }
    pop() { }
    peek() { }
    isEmpty() { }
  }
  ```
- Implement Queue class:
  ```javascript
  class Queue {
    constructor() {
      this.items = [];
    }
    
    enqueue(item) { }
    dequeue() { }
    front() { }
    isEmpty() { }
  }
  ```

### Day 4: Stack/Queue Problems (1.5 hours)
**Practice (1.5 hours):**
- LeetCode Easy: [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- LeetCode Medium: [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- LeetCode Medium: [Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)

### Day 5: Core JavaScript - Prototypes & Inheritance (1 hour)
**Study (1 hour):**
- Understand JavaScript prototype chain
- Study ES6 classes vs constructor functions
- Review inheritance patterns
- Read: [Frontend Advanced: Event Loop](../../coding/dsa/frontend-advanced-questions.md#event-loop--microtasks)
- Practice examples:
  ```javascript
  // Prototype example
  function Person(name) {
    this.name = name;
  }
  Person.prototype.greet = function() {
    return `Hello, ${this.name}`;
  };
  
  // ES6 Class
  class Person {
    constructor(name) {
      this.name = name;
    }
    greet() {
      return `Hello, ${this.name}`;
    }
  }
  
  // Inheritance
  class Developer extends Person {
    constructor(name, language) {
      super(name);
      this.language = language;
    }
  }
  ```

### Day 6: Review & Practice (2 hours)
**Review (30 min):**
- Review all problems from this week
- Understand when to use stack vs queue

**Practice (1.5 hours):**
- Re-solve Reverse Linked List (try both iterative and recursive)
- LeetCode Medium: [Remove Nth Node From End](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
- LeetCode Medium: [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you implement LinkedList operations?
- Can you explain when to use stack vs queue?
- Can you explain prototype chain?

**Practice:**
- Solve one new problem without hints
- Review weak areas

---

## Key Problems to Master

### Must Solve (Easy)
1. [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) - Iterative and recursive
2. [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) - Stack application
3. [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) - Two pointers

### Must Solve (Medium)
1. [Remove Nth Node From End](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) - Two pointers
2. [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) - Carry handling
3. [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) - Monotonic stack

---

## Study Materials

### Internal Resources
- [DSA Linked Lists](../../coding/dsa/dsa-interview-questions.md#linked-lists)
- [DSA Stacks & Queues](../../coding/dsa/dsa-interview-questions.md#stacks--queues)
- [Frontend Advanced: Event Loop](../../coding/dsa/frontend-advanced-questions.md#event-loop--microtasks)

### External Resources
- LeetCode Linked List Tag: https://leetcode.com/tag/linked-list/
- NeetCode Linked List: https://neetcode.io/practice

---

## Common Patterns to Recognize

1. **Two Pointers in Linked Lists:**
   - Fast and slow pointers (cycle detection)
   - Finding middle node
   - Finding nth node from end

2. **Stack for Matching:**
   - Parentheses matching
   - Monotonic stack (next greater element)

3. **Dummy Head:**
   - Simplifies edge cases
   - Easier to handle empty lists

---

## Tips

- **Draw diagrams:** Visualize pointer movements before coding
- **Handle edge cases:** Empty list, single node, null pointers
- **Test thoroughly:** Create test cases for your implementations
- **Understand recursion:** Many linked list problems have elegant recursive solutions

---

## Weekly Checklist

- [ ] Implemented LinkedList class from scratch
- [ ] Implemented Stack and Queue classes
- [ ] Solved at least 6 problems (3 Easy, 3 Medium)
- [ ] Reviewed prototypes and inheritance
- [ ] Can explain pointer manipulation clearly
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 3 will cover Trees & Binary Search Trees. Make sure you're comfortable with:
- Pointer manipulation
- Recursive thinking
- Stack/Queue operations
