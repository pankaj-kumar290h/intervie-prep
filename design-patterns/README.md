# Design Patterns - JavaScript & Node.js

## Overview

This folder contains comprehensive design patterns for JavaScript and Node.js with practical, real-world examples.

## 📁 Folder Structure

```
design-patterns/
│
├── javascript/
│   ├── 01-creational.md      # Factory, Singleton, Builder, Prototype
│   ├── 02-structural.md      # Adapter, Decorator, Facade, Proxy
│   ├── 03-behavioral.md      # Observer, Strategy, Command, State
│   └── 04-functional.md      # Composition, Currying, Memoization
│
├── nodejs/
│   ├── 01-module-patterns.md          # CommonJS, ES Modules, Revealing Module
│   ├── 02-async-patterns.md           # Callbacks, Promises, Async/Await
│   ├── 03-middleware-patterns.md      # Express, Koa, Pipeline
│   ├── 04-streaming-patterns.md       # Transform, Pipeline, Backpressure
│   └── 05-microservices-patterns.md   # Circuit Breaker, Saga, CQRS
│
└── README.md
```

## 🎯 Pattern Categories

### JavaScript Patterns

| Category | Patterns | Use Cases |
|----------|----------|-----------|
| **Creational** | Factory, Singleton, Builder, Prototype | Object creation |
| **Structural** | Adapter, Decorator, Facade, Proxy | Object composition |
| **Behavioral** | Observer, Strategy, Command, State | Object communication |
| **Functional** | Composition, Currying, Memoization | Functional programming |

### Node.js Patterns

| Category | Patterns | Use Cases |
|----------|----------|-----------|
| **Module** | CommonJS, ES Modules, Revealing Module | Code organization |
| **Async** | Callbacks, Promises, Async/Await, Queues | Asynchronous operations |
| **Middleware** | Express, Pipeline, Chain of Responsibility | Request processing |
| **Streaming** | Transform, Pipeline, Backpressure | Data processing |
| **Microservices** | Circuit Breaker, Saga, CQRS | Distributed systems |

## 🚀 Quick Start

### For Frontend Developers
1. Start with [JavaScript Creational Patterns](./javascript/01-creational-patterns.md)
2. Move to [Structural Patterns](./javascript/02-structural-patterns.md)
3. Learn [Behavioral Patterns](./javascript/03-behavioral-patterns.md)
4. Master [Functional Patterns](./javascript/04-functional-patterns.md)

### For Backend Developers
1. Start with [Node.js Module Patterns](./nodejs/01-module-patterns.md)
2. Master [Async Patterns](./nodejs/02-async-patterns.md)
3. Learn [Middleware Patterns](./nodejs/03-middleware-patterns.md)
4. Study [Streaming Patterns](./nodejs/04-streaming-patterns.md)
5. Apply [Microservices Patterns](./nodejs/05-microservices-patterns.md)

## 💡 When to Use Each Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│                    PATTERN SELECTION GUIDE                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  "Need to create objects flexibly..."        → Factory Pattern     │
│  "Need only one instance..."                 → Singleton Pattern   │
│  "Need to construct complex objects..."      → Builder Pattern     │
│  "Need to clone objects..."                  → Prototype Pattern   │
│                                                                     │
│  "Need to adapt incompatible interfaces..."  → Adapter Pattern     │
│  "Need to add behavior dynamically..."       → Decorator Pattern   │
│  "Need to simplify complex subsystem..."     → Facade Pattern      │
│  "Need to control access to object..."       → Proxy Pattern       │
│                                                                     │
│  "Need to notify multiple objects..."        → Observer Pattern    │
│  "Need interchangeable algorithms..."        → Strategy Pattern    │
│  "Need to queue/log/undo operations..."      → Command Pattern     │
│  "Need to change behavior based on state..." → State Pattern       │
│                                                                     │
│  "Need to handle failures gracefully..."     → Circuit Breaker     │
│  "Need distributed transactions..."          → Saga Pattern        │
│  "Need to separate reads/writes..."          → CQRS Pattern        │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## 📚 Learning Path

### Beginner
- [ ] Singleton Pattern
- [ ] Factory Pattern
- [ ] Module Pattern
- [ ] Observer Pattern

### Intermediate
- [ ] Builder Pattern
- [ ] Decorator Pattern
- [ ] Strategy Pattern
- [ ] Middleware Pattern

### Advanced
- [ ] Proxy Pattern
- [ ] Command Pattern
- [ ] Streaming Patterns
- [ ] Circuit Breaker
- [ ] CQRS & Event Sourcing

## 🔧 Practical Applications

Each pattern includes:
- ✅ Clear explanation
- ✅ When to use / When not to use
- ✅ Real-world examples
- ✅ Production-ready code
- ✅ Common pitfalls
- ✅ Testing strategies

मालिक, master these patterns and write cleaner, more maintainable code! 🚀
