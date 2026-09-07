# Prototypes & Inheritance — Interview Questions

Asked at: Amazon, Microsoft, Adobe, Oracle, Walmart, Flipkart, Swiggy.

Every object has an internal `[[Prototype]]` (accessed via `Object.getPrototypeOf` / `__proto__`).
Property lookup walks the prototype chain until `null`. `Fn.prototype` is the object that
becomes the `[[Prototype]]` of instances created with `new Fn()`.

---

## A. Output prediction

1. ```js
   function A() {}
   A.prototype.x = 1;
   const a = new A();
   A.prototype.x = 2;
   console.log(a.x); // ?
   a.x = 3;
   console.log(a.x, A.prototype.x); // ?
   ```

2. ```js
   const obj = {};
   console.log(obj.toString);            // ?
   console.log(obj.hasOwnProperty('x')); // ?
   console.log('toString' in obj);       // ?
   console.log(Object.keys(obj));        // ?
   ```

3. ```js
   function Animal(name) { this.name = name; }
   Animal.prototype.speak = function () { return `${this.name} speaks`; };
   function Dog(name) { Animal.call(this, name); }
   Dog.prototype = Object.create(Animal.prototype);
   Dog.prototype.constructor = Dog;
   const d = new Dog('Rex');
   console.log(d.speak());                       // ?
   console.log(d instanceof Animal, d instanceof Dog); // ?
   ```

4. ```js
   class A { greet() { return 'A'; } }
   class B extends A { greet() { return super.greet() + 'B'; } }
   console.log(new B().greet()); // ?
   ```

5. ```js
   console.log([].__proto__ === Array.prototype);            // ?
   console.log(Array.prototype.__proto__ === Object.prototype); // ?
   console.log(Object.prototype.__proto__);                  // ?
   ```

6. ```js
   function F() { return { a: 1 }; }
   function G() { this.a = 2; }
   console.log(new F());  // ?  (constructor returning an object)
   console.log(new G());  // ?
   ```

7. ```js
   const proto = { greet() { return 'hi ' + this.name; } };
   const o = Object.create(proto);
   o.name = 'Sam';
   console.log(o.greet());              // ?
   console.log(o.hasOwnProperty('greet')); // ?
   ```

8. Shadowing methods + `for...in`:
   ```js
   function P() {}
   P.prototype.role = 'user';
   const p = new P();
   p.name = 'A';
   for (const k in p) console.log(k); // ? (own + inherited enumerable)
   ```

---

## B. Implement

9. **`myNew(Constructor, ...args)`** — polyfill the `new` operator (create obj, link proto,
   run constructor, honor an object return value).

10. **`myInstanceof(obj, Constructor)`** — walk the prototype chain.

11. **`inherit(Child, Parent)`** — set up prototypal inheritance the classic way
    (`Object.create`, fix `constructor`).

12. **`Object.create` polyfill** (`myObjectCreate(proto, propsDescriptor?)`).

13. **`myObjectAssign(target, ...sources)`** — own enumerable props only, respect getters.

14. **`deepGetPrototypeChain(obj)`** — return array of prototypes up to `null`.

15. **Mixin**: `applyMixins(TargetClass, ...mixins)` copying methods onto the prototype.

16. **`createClass`** — a factory that mimics ES6 `class` using functions + prototypes
    (constructor, instance methods, static methods, single-level `extends`).

17. **`Function.prototype.myBind`** again but focus on: `new (bound)()` preserving prototype.

---

## C. Conceptual

18. Difference between `__proto__`, `[[Prototype]]`, and `Constructor.prototype`.
19. `Object.create(null)` — why use it? (no prototype pollution, safe map)
20. `class` vs constructor function — 5 concrete differences (hoisting, strict mode, `new`
    enforcement, non-enumerable methods, `super`).
21. Why is adding to `Array.prototype` considered dangerous?
22. `hasOwnProperty` vs `in` vs `Object.hasOwn` vs optional chaining.
23. How does `super.method()` resolve? (via `[[HomeObject]]`, not `this`)
24. Prototype chain of a class instance with `extends` — draw it for `class B extends A`.
25. What is `Object.getPrototypeOf(Object.prototype)` and why?

---

## Must be able to state

- `new Fn()`: creates `{}`, sets its proto to `Fn.prototype`, runs `Fn` with `this` = that
  object, returns it unless `Fn` explicitly returns an object.
- Instances share one copy of prototype methods; instance fields are per-object.
- `instanceof` checks whether `Constructor.prototype` appears in the object's chain.
- `class` is syntactic sugar over prototypes + a stricter `new` requirement; methods are
  non-enumerable.
- `Object.create(proto)` makes a new object with `proto` as its `[[Prototype]]`.
