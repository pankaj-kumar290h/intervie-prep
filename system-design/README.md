# System Design Interview Questions

This directory contains comprehensive system design questions and solutions for **senior developers** covering both frontend and backend architecture.

## 📂 Contents

### Frontend System Design
**File**: `frontend-system-design.md`

Covers client-side architecture and design patterns:
1. **Real-Time Chat Application** - WebSocket, optimistic updates, offline support
2. **News Feed (Facebook/Twitter)** - Infinite scroll, virtual rendering, real-time updates
3. **Video Streaming Platform (YouTube/Netflix)** - Adaptive bitrate, analytics, recommendations
4. **Image Gallery (Pinterest/Instagram)** - Lazy loading, virtualization, image optimization
5. **Collaborative Document Editor (Google Docs)** - Operational transforms, conflict resolution
6. **E-Commerce Product Page** - State management, inventory updates, checkout flow
7. **Typeahead/Autocomplete System** - Debouncing, caching, relevance ranking
8. **Notification System** - Web Push, service workers, real-time delivery
9. **Data Visualization Dashboard** - Performance optimization, large datasets, real-time updates
10. **Component Library** - Design systems, accessibility, theming

**Focus Areas**:
- Performance optimization (FCP, LCP, TTI)
- Real-time communication (WebSocket, SSE)
- Offline-first architecture (Service Workers, IndexedDB)
- State management at scale
- Browser rendering optimization
- Accessibility (WCAG, ARIA)

---

### Backend System Design
**File**: `backend-system-design.md`

Covers server-side architecture and distributed systems:
1. **URL Shortener (bit.ly)** - ID generation, database design, caching
2. **Rate Limiter** - Token bucket, sliding window, distributed limiting
3. **Distributed Cache (Redis)** - Caching strategies, invalidation, high availability
4. **Message Queue (Kafka/RabbitMQ)** - Event-driven architecture, pub-sub patterns
5. **API Gateway** - Request routing, authentication, rate limiting
6. **Authentication System** - JWT, OAuth2, session management
7. **E-Commerce Order System** - Transaction management, inventory, payments
8. **Real-Time Leaderboard** - Sorted sets, ranking algorithms, caching
9. **Search Engine (Elasticsearch)** - Indexing, relevance ranking, aggregations
10. **Payment System** - Idempotency, reconciliation, security

**Focus Areas**:
- Scalability (horizontal/vertical)
- Consistency vs Availability (CAP theorem)
- Database design and optimization
- Microservices architecture
- Distributed systems patterns
- Security best practices
- Monitoring and observability

---

## 🎯 How to Use

### For Interview Preparation
1. **Read the problem statement** - Understand functional and non-functional requirements
2. **Analyze the capacity estimation** - Calculate storage, bandwidth, and throughput needs
3. **Study the architecture** - Understand component interactions and data flow
4. **Review the code examples** - See how concepts are implemented
5. **Note the trade-offs** - Understand design decisions and alternatives

### For System Design Practice
1. Start with **high-level architecture**
2. Break down into **components**
3. Define **APIs and data models**
4. Discuss **scalability and bottlenecks**
5. Address **failure scenarios**
6. Consider **monitoring and maintenance**

---

## 📊 System Design Framework

### 1. Requirements Clarification (5 minutes)
```
Functional Requirements:
- What features does the system need?
- What are the core use cases?
- What is the expected user flow?

Non-Functional Requirements:
- Scale: How many users? How much data?
- Performance: Latency requirements?
- Availability: Uptime requirements?
- Consistency: Strong or eventual?
```

### 2. Capacity Estimation (5 minutes)
```
Traffic Estimation:
- Daily Active Users (DAU)
- Requests Per Second (RPS)
- Peak traffic multiplier

Storage Estimation:
- Data size per entity
- Growth rate
- Retention period

Bandwidth Estimation:
- Average request/response size
- Upload/download ratio
```

### 3. System APIs (5 minutes)
```javascript
// Example: URL Shortener
POST /api/shorten
Request: { longURL, customAlias?, expiresIn? }
Response: { shortURL, longURL, expiresAt }

GET /:shortCode
Response: 301 Redirect to longURL

GET /api/analytics/:shortCode
Response: { clicks, clicksByDay, clicksByCountry }
```

### 4. Data Model (10 minutes)
```sql
-- Example: URL Shortener
CREATE TABLE urls (
  id BIGINT PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  clicks INTEGER DEFAULT 0,
  INDEX idx_short_code (short_code),
  INDEX idx_user_id (user_id)
);

CREATE TABLE clicks (
  id BIGINT PRIMARY KEY,
  short_code VARCHAR(10) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(2),
  INDEX idx_short_code_timestamp (short_code, timestamp)
);
```

### 5. High-Level Design (15 minutes)
```
Components:
├── Load Balancer (HAProxy, Nginx)
├── Application Servers (Node.js cluster)
├── Cache Layer (Redis cluster)
├── Database (PostgreSQL primary + replicas)
├── Message Queue (Kafka)
├── Object Storage (S3)
└── CDN (CloudFront)

Data Flow:
Client → CDN → Load Balancer → App Servers → Cache → Database
                                           ↓
                                    Message Queue → Workers
```

### 6. Detailed Design (20 minutes)
Focus on 2-3 critical components:
- **Algorithm design** (e.g., ID generation, ranking)
- **Caching strategy** (e.g., write-through, cache-aside)
- **Database optimization** (e.g., indexing, sharding)
- **Failure handling** (e.g., retry, circuit breaker)

### 7. Identifying Bottlenecks (5 minutes)
```
Potential Bottlenecks:
- Single point of failure
- Database write contention
- Network bandwidth
- Memory constraints
- CPU-intensive operations

Solutions:
- Replication and failover
- Database sharding/partitioning
- CDN for static content
- Caching hot data
- Async processing with queues
```

---

## 🔑 Key Concepts

### CAP Theorem
```
Consistency: All nodes see the same data
Availability: System remains operational
Partition Tolerance: System works despite network failures

You can only choose 2 out of 3:
- CP: Strong consistency (e.g., banking systems)
- AP: High availability (e.g., social media)
- CA: Not realistic in distributed systems
```

### Database Patterns
```
Sharding: Horizontal partitioning
  - By hash: Uniform distribution
  - By range: Time-series data
  - By geography: Regional data

Replication:
  - Master-Slave: Read scalability
  - Master-Master: Write scalability
  - Eventual consistency: Performance

Indexing:
  - B-tree: Range queries
  - Hash: Exact matches
  - Full-text: Search queries
```

### Caching Strategies
```
Cache-Aside (Lazy Loading):
  1. Check cache
  2. On miss, load from DB
  3. Update cache

Write-Through:
  1. Write to cache
  2. Write to DB synchronously

Write-Behind:
  1. Write to cache
  2. Write to DB asynchronously (batched)

Read-Through:
  Cache handles DB loading
```

### Load Balancing
```
Algorithms:
- Round Robin: Simple, fair
- Least Connections: Dynamic load
- IP Hash: Session persistence
- Weighted: Server capacity
- Least Response Time: Performance

Types:
- L4 (Transport): TCP/UDP
- L7 (Application): HTTP/HTTPS
```

---

## 📚 Additional Resources

### Books
- **"Designing Data-Intensive Applications"** by Martin Kleppmann
- **"System Design Interview"** by Alex Xu
- **"Web Scalability for Startup Engineers"** by Artur Ejsmont

### Online Resources
- [High Scalability Blog](http://highscalability.com/)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Grokking the System Design Interview](https://www.educative.io/courses/grokking-the-system-design-interview)

### Real-World System Designs
- [Netflix Tech Blog](https://netflixtechblog.com/)
- [Uber Engineering Blog](https://eng.uber.com/)
- [Airbnb Engineering Blog](https://medium.com/airbnb-engineering)
- [Instagram Engineering Blog](https://instagram-engineering.com/)

---

## 🎓 Interview Tips

### Do's
✅ **Clarify requirements** before diving into design
✅ **Start with high-level** architecture, then drill down
✅ **Discuss trade-offs** for every design decision
✅ **Consider scalability** from the beginning
✅ **Think about failure scenarios** and how to handle them
✅ **Use numbers** for capacity estimation
✅ **Draw diagrams** to visualize the system
✅ **Communicate clearly** and think out loud

### Don'ts
❌ **Don't jump into details** without understanding requirements
❌ **Don't assume** - ask clarifying questions
❌ **Don't over-engineer** - start simple, then scale
❌ **Don't ignore non-functional requirements**
❌ **Don't forget about monitoring** and maintenance
❌ **Don't be silent** - explain your thought process

---

## 🏗️ Common Patterns

### 1. Microservices Patterns
- **API Gateway**: Single entry point
- **Service Discovery**: Dynamic service location
- **Circuit Breaker**: Fault tolerance
- **Bulkhead**: Resource isolation
- **Saga**: Distributed transactions

### 2. Data Patterns
- **CQRS**: Command Query Responsibility Segregation
- **Event Sourcing**: Audit trail, replay
- **Database per Service**: Data isolation
- **Shared Database**: Simple but coupled

### 3. Communication Patterns
- **Request-Response**: Synchronous (REST, GraphQL)
- **Event-Driven**: Asynchronous (Kafka, RabbitMQ)
- **Pub-Sub**: Broadcast messaging
- **Request-Reply**: RPC-style

### 4. Resilience Patterns
- **Retry**: Transient failure handling
- **Timeout**: Prevent hanging
- **Circuit Breaker**: Prevent cascade failures
- **Rate Limiting**: Protect from overload
- **Bulkhead**: Isolate failures

---

## 💡 Practice Questions

### Beginner Level
1. Design a URL Shortener
2. Design a Rate Limiter
3. Design a Key-Value Store

### Intermediate Level
4. Design Instagram Feed
5. Design Uber Backend
6. Design a Web Crawler
7. Design a Notification System

### Advanced Level
8. Design WhatsApp/Messenger
9. Design Netflix/YouTube
10. Design Google Maps
11. Design Uber/Lyft
12. Design Airbnb/Booking.com

---

## 🤝 Contributing

Found an issue or want to add more questions? Feel free to contribute!

---

**मालिक, master these system design concepts and you'll excel in senior developer interviews!** 🚀

