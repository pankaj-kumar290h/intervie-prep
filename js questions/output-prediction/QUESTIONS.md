# Output Prediction — Rapid-Fire "What Does This Log?"

Asked at: every company, in the phone screen / first 15 minutes. Say the answer AND the reason.
Answers are in `SOLUTIONS.md` — cover them and self-test.

---

## Coercion & equality

1. `console.log(0.1 + 0.2 === 0.3)`
2. `console.log([] == ![])`
3. `console.log(null == undefined, null === undefined)`
4. `console.log(NaN === NaN, Object.is(NaN, NaN))`
5. `console.log(typeof null, typeof NaN, typeof [], typeof function(){})`
6. `console.log(1 < 2 < 3, 3 > 2 > 1)`
7. `console.log('5' - 3, '5' + 3, '5' * '2')`
8. `console.log([] + [], [] + {}, {} + [])`
9. `console.log(true + true + true)`
10. `console.log(+'', +'  ', +'0x10', +null, +undefined, +[], +[1], +[1,2])`

## Scope, hoisting, closures

11. `for (var i=0;i<3;i++) setTimeout(()=>console.log(i)); ` (then with `let`)
12. ```js
    let x = 1;
    function f() { console.log(x); let x = 2; }
    f();
    ```
13. ```js
    var a = 10;
    function foo() { console.log(a); var a = 20; }
    foo();
    ```
14. ```js
    (function() { console.log(typeof bar); var bar = 1; function bar() {} })();
    ```

## `this`

15. ```js
    const o = { n: 1, get() { return this.n; } };
    const g = o.get;
    console.log(o.get(), g());
    ```
16. ```js
    const o = { n: 1, get: () => this.n };
    console.log(o.get());
    ```
17. ```js
    function F() { this.x = 1; return { x: 2 }; }
    console.log(new F().x);
    ```

## Event loop / async

18. ```js
    console.log(1);
    setTimeout(() => console.log(2));
    Promise.resolve().then(() => console.log(3));
    console.log(4);
    ```
19. ```js
    async function f(){ console.log('a'); await 0; console.log('b'); }
    console.log('start'); f(); console.log('end');
    ```
20. ```js
    Promise.resolve('x')
      .then(v => { throw new Error(v); })
      .catch(e => e.message)
      .then(console.log);
    ```
21. ```js
    Promise.resolve(1).then(() => 2).then(3).then(console.log);
    ```
22. ```js
    setTimeout(() => console.log('t'), 0);
    Promise.resolve().then(() => { for(;;){} });   // what never prints?
    ```

## Objects, arrays, references

23. ```js
    const a = { x: 1 }; const b = a; b.x = 2; console.log(a.x);
    ```
24. ```js
    const arr = [1,2,3]; const copy = arr; copy.push(4); console.log(arr.length);
    ```
25. `console.log([1,2,3].map(parseInt))`
26. `console.log([1,2,10].sort())`
27. ```js
    const obj = { a: 1, b: 2 };
    const { a, ...rest } = obj;
    console.log(a, rest);
    ```
28. ```js
    const o = {}; o[[1,2]] = 'x'; console.log(o['1,2']);
    ```
29. ```js
    console.log(JSON.stringify({ a: undefined, b: () => {}, c: NaN, d: [undefined] }));
    ```
30. ```js
    const s = new Set([1, '1', 1, NaN, NaN]);
    console.log([...s]);
    ```

## Numbers & misc

31. `console.log(typeof typeof 1)`
32. `console.log(0.1.toFixed(20))`
33. `console.log(9999999999999999)`
34. `console.log(Math.max(), Math.min())`
35. `console.log(parseInt('0.0000005'))`  and  `console.log((0.0000005).toString())`
36. ```js
    let a = 1, b = 2;
    [a, b] = [b, a];
    console.log(a, b);
    ```
37. ```js
    const f = (a, b = a) => [a, b];
    console.log(f(1), f(1, 2));
    ```
38. ```js
    console.log((function(){ return arguments.length; })(1,2,3));
    console.log(((...args) => args.length)(1,2,3));
    ```
39. ```js
    label: for (let i=0;i<3;i++){ for(let j=0;j<3;j++){ if(j===1) continue label; console.log(i,j);} }
    ```
40. ```js
    const x = { valueOf: () => 10, toString: () => '20' };
    console.log(x + 1, `${x}`, x == 10);
    ```

---

## How to practice

- Cover `SOLUTIONS.md`, answer aloud with the "because…", then reveal.
- Run `node practice.js` to check — it prints each snippet's real output.
- Target: <20s per question, always with a reason.
