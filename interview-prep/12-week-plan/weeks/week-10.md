# Week 10: System Design Basics

**Time Commitment:** 8-9 hours  
**Focus:** Introduction to system design, scalability, and microservices patterns

---

## Learning Objectives

By the end of this week, you should be able to:
- Understand system design fundamentals
- Design a basic distributed system
- Explain scalability concepts
- Understand microservices patterns

---

## Day-by-Day Breakdown

### Day 1: System Design Fundamentals (2 hours)
**Study (2 hours):**
- Read [System Design Concepts](../../system-design/system-design-concepts.md)
- Focus on:
  - Scalability (horizontal vs vertical)
  - Load balancing
  - Caching strategies
  - Database choices (SQL vs NoSQL)
- Understand the system design process:
  1. Requirements (functional & non-functional)
  2. Capacity estimation
  3. High-level design
  4. Detailed design
  5. Trade-offs

### Day 2: URL Shortener Design (3 hours)
**Study (1 hour):**
- Review [Backend System Design: URL Shortener](../../system-design/backend-system-design.md#url-shortener)
- Understand:
  - Base62 encoding
  - Distributed ID generation
  - Database schema design

**Practice (2 hours):**
- Design URL Shortener on paper:
  - Draw architecture diagram
  - Design database schema
  - Estimate capacity (QPS, storage)
  - Identify bottlenecks
  - Discuss scaling strategies
- Practice explaining your design

### Day 3: Caching & Load Balancing (2 hours)
**Study (1 hour):**
- Review caching strategies:
  - Cache-Aside
  - Write-Through
  - Write-Behind
- Understand load balancing:
  - Round-robin
  - Least connections
  - Consistent hashing

**Practice (1 hour):**
- Review [Backend System Design: Distributed Cache](../../system-design/backend-system-design.md#distributed-cache)
- Practice explaining caching strategies

### Day 4: Rate Limiting Design (2 hours)
**Study (1 hour):**
- Review [Backend System Design: Rate Limiter](../../system-design/backend-system-design.md#rate-limiter)
- Understand algorithms:
  - Token Bucket
  - Sliding Window
  - Fixed Window

**Practice (1 hour):**
- Design a rate limiter:
  - Choose algorithm
  - Design data structures
  - Handle distributed systems
  - Discuss trade-offs

### Day 5: Microservices Patterns (1 hour)
**Study (1 hour):**
- Read [Backend Advanced: Rate Limiting](../../coding/questions/backend-advanced-questions.md#rate-limiting--throttling)
- Review [Node.js Microservices Patterns](../../../../design-patterns/nodejs/05-microservices-patterns.md)
- Understand:
  - Circuit Breaker pattern
  - Service discovery
  - API Gateway
- Practice examples:
  ```javascript
  // Circuit Breaker
  class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
      this.failures = 0;
      this.threshold = threshold;
      this.timeout = timeout;
      this.state = 'CLOSED';
    }
    
    async execute(fn) {
      if (this.state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }
      
      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }
  }
  ```

### Day 6: Practice Design Problem (2 hours)
**Practice (2 hours):**
- Design: News Feed System
  - Review [Frontend System Design: News Feed](../../system-design/frontend-system-design.md#news-feed)
  - Draw architecture
  - Design data models
  - Discuss real-time updates
  - Handle scale (millions of users)
- Practice explaining your design (30-45 minutes)

### Day 7: Weekly Assessment (1 hour)
**Self-Assessment:**
- Can you explain scalability concepts?
- Can you design a basic system?
- Can you discuss trade-offs?

**Practice:**
- Review one system design problem
- Practice drawing architecture diagrams

---

## Key Concepts to Master

### System Design Fundamentals
1. **Scalability:**
   - Horizontal scaling (add more servers)
   - Vertical scaling (upgrade hardware)
   - When to use each

2. **Load Balancing:**
   - Distribute traffic
   - Health checks
   - Session persistence

3. **Caching:**
   - Reduce database load
   - Improve response time
   - Cache invalidation strategies

4. **Database:**
   - SQL vs NoSQL
   - Replication
   - Sharding

### Design Process
1. **Requirements:**
   - Functional requirements
   - Non-functional requirements (scale, latency, availability)

2. **Capacity Estimation:**
   - QPS (queries per second)
   - Storage requirements
   - Bandwidth

3. **High-Level Design:**
   - Components
   - APIs
   - Data flow

4. **Detailed Design:**
   - Database schema
   - Algorithms
   - Trade-offs

---

## Study Materials

### Internal Resources
- [System Design Concepts](../../system-design/system-design-concepts.md)
- [Backend System Design](../../system-design/backend-system-design.md)
- [Frontend System Design](../../system-design/frontend-system-design.md)
- [Node.js Microservices Patterns](../../../../design-patterns/nodejs/05-microservices-patterns.md)

### External Resources
- System Design Primer: https://github.com/donnemartin/system-design-primer
- High Scalability: http://highscalability.com/

---

## Common Patterns to Recognize

1. **Caching Strategy:**
   - Cache-Aside: Most common
   - Write-Through: Consistency
   - Write-Behind: Performance

2. **Database Choice:**
   - SQL: Structured data, ACID
   - NoSQL: Unstructured, scale

3. **Load Balancing:**
   - Round-robin: Simple
   - Consistent hashing: Distributed

---

## Tips

- **Start broad:** High-level design first
- **Estimate capacity:** Always do back-of-envelope calculations
- **Discuss trade-offs:** No perfect solution
- **Practice drawing:** Architecture diagrams are important
- **Think scale:** Design for millions of users

---

## Weekly Checklist

- [ ] Read system design concepts
- [ ] Designed URL Shortener
- [ ] Understand caching strategies
- [ ] Understand load balancing
- [ ] Reviewed microservices patterns
- [ ] Practiced explaining designs
- [ ] Logged progress in [Progress Tracker](../../progress-tracker.md)

---

## Next Week Preview

Week 11 will focus on Mock Interviews & Review. Make sure you're comfortable with:
- System design basics
- Explaining your designs
- Trade-off analysis
