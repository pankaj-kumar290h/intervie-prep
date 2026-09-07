# Hoisting, Scope, TDZ — Interview Questions

Asked at: Amazon, Microsoft, Adobe, Flipkart, Paytm, PhonePe, Walmart — screening & output rounds.

- `var` → function-scoped, hoisted, initialized to `undefined`.
- `let`/`const` → block-scoped, hoisted but in the **Temporal Dead Zone** until the declaration.
- Function **declarations** are fully hoisted; function **expressions** / arrow fns follow their
  variable's rules.
- `class` declarations are hoisted but in TDZ.

---

## A. Output prediction

1. ```js
   console.log(a); var a = 1; console.log(a);
   ```

2. ```js
   console.log(b); let b = 2;
   ```

3. ```js
   foo();
   function foo() { console.log('decl'); }
   bar();
   var bar = function () { console.log('expr'); };
   ```

4. ```js
   var x = 1;
   function f() {
     console.log(x);
     var x = 2;
   }
   f();
   ```

5. ```js
   for (var i = 0; i < 3; i++) {}
   console.log(i);
   for (let j = 0; j < 3; j++) {}
   console.log(typeof j);
   ```

6. ```js
   let x = 10;
   {
     console.log(x);   // ?
     let x = 20;
   }
   ```

7. ```js
   function f() {
     return g();
     function g() { return 1; }
     var g = function () { return 2; };
   }
   console.log(f());
   ```

8. ```js
   var a = 1;
   (function () {
     console.log(a);
     var a = 2;
     console.log(a);
   })();
   ```

9. ```js
   if (false) { var x = 1; }
   console.log(x);        // ?
   console.log(typeof y); // y never declared
   ```

10. ```js
    console.log(typeof foo);
    console.log(typeof bar);
    function foo() {}
    let bar = 1;
    ```

11. Block-scoped function declaration (sloppy vs strict):
    ```js
    { function h() { return 1; } }
    console.log(typeof h);
    ```

12. ```js
    const obj = { a: 1 };
    obj.a = 2;          // ok?
    obj = {};           // ?
    ```

13. Redeclaration:
    ```js
    var v = 1; var v = 2;    // ?
    let l = 1; let l = 2;    // ?
    ```

14. ```js
    let funcs = [];
    for (var i = 0; i < 3; i++) {
      funcs.push(() => i);
    }
    console.log(funcs.map(f => f()));
    ```

---

## B. Conceptual

15. Define hoisting precisely — what actually moves? (declarations register in the
    Environment Record during creation phase; initializers stay put)
16. What is the TDZ and why does it exist? (catch use-before-init bugs)
17. `let` in a `for` loop — how many bindings are created? (one per iteration, plus copy semantics)
18. Function declaration vs function expression vs named function expression — hoisting & name scope.
19. Lexical (static) scope vs dynamic scope — JS uses which?
20. Global scope: `var x` at top level in a script vs a module vs Node CJS — is it on `globalThis`?
21. IIFE — what problem did it solve pre-ES6? Still needed?
22. Block scope vs function scope — give an example where switching `var`→`let` changes behaviour.
23. `typeof undeclaredVar` doesn't throw, but `undeclaredLet` in TDZ does — why the asymmetry?
24. Closures + `var` loop bug — explain in terms of scope, then in terms of the event loop.

---

## Must be able to state

- Creation phase registers all declarations; `var` → `undefined`, `let`/`const`/`class` → TDZ,
  function declarations → fully assigned.
- TDZ = from block start to the declaration line; accessing throws `ReferenceError`.
- `var` ignores blocks (`if`, `for`); `let`/`const` respect them.
- `let` gives each loop iteration a fresh binding — fixes the classic closure-in-loop bug.
- `const` prevents reassignment, not mutation of the referenced object.
