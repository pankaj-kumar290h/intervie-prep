# Advanced TypeScript Interview Questions

## Table of Contents
1. [Type System Deep Dive](#type-system-deep-dive)
2. [Generics & Constraints](#generics--constraints)
3. [Conditional Types](#conditional-types)
4. [Mapped Types](#mapped-types)
5. [Template Literal Types](#template-literal-types)
6. [Type Guards & Narrowing](#type-guards--narrowing)
7. [Utility Types Implementation](#utility-types-implementation)
8. [Declaration Files & Module Augmentation](#declaration-files--module-augmentation)
9. [Advanced Patterns](#advanced-patterns)
10. [Real-World Type Challenges](#real-world-type-challenges)

---

## Type System Deep Dive

### Question 1: Understanding Type Inference

```typescript
/**
 * Type Inference Scenarios
 */

// 1. Variable inference
let x = 3; // inferred as number
const y = 3; // inferred as literal type 3

// 2. Function return type inference
function add(a: number, b: number) {
  return a + b; // inferred return type: number
}

// 3. Array inference
const arr = [1, 2, 3]; // number[]
const mixed = [1, 'hello', true]; // (string | number | boolean)[]
const tuple = [1, 'hello'] as const; // readonly [1, "hello"]

// 4. Object inference
const obj = { name: 'John', age: 30 }; // { name: string; age: number; }
const objConst = { name: 'John', age: 30 } as const; 
// { readonly name: "John"; readonly age: 30; }

/**
 * Challenge: Fix the type inference issues
 */

// Problem 1: Object property inference
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: 'Alice', age: 25 };
const name = getProperty(person, 'name'); // string
const age = getProperty(person, 'age'); // number

// Problem 2: Array element inference
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const numbers = [1, 2, 3];
const first = firstElement(numbers); // number | undefined

// Problem 3: Promise inference
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}

interface User {
  id: number;
  name: string;
}

const user = await fetchData<User>('/api/user'); // User

/**
 * Structural Typing vs Nominal Typing
 */

// TypeScript uses structural typing
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function printPoint(point: Point2D) {
  console.log(`${point.x}, ${point.y}`);
}

const point3D: Point3D = { x: 1, y: 2, z: 3 };
printPoint(point3D); // Works! Structural compatibility

// Creating nominal types using brands
type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

function usd(amount: number): USD {
  return amount as USD;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const dollars = usd(100);
const euros = eur(100);
// addUSD(dollars, euros); // Error! Can't mix currencies
addUSD(dollars, usd(50)); // OK
```

---

## Generics & Constraints

### Question 2: Advanced Generics

```typescript
/**
 * Generic Constraints
 */

// Basic constraint
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength('hello'); // 5
getLength([1, 2, 3]); // 3
getLength({ length: 10 }); // 10
// getLength(123); // Error: number doesn't have length

// Multiple constraints using intersection
interface Nameable {
  name: string;
}

interface Aged {
  age: number;
}

function greet<T extends Nameable & Aged>(person: T): string {
  return `Hello ${person.name}, you are ${person.age} years old`;
}

// Keyof constraint
function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map(key => obj[key]);
}

const user = { name: 'John', age: 30, email: 'john@example.com' };
const values = pluck(user, ['name', 'email']); // (string)[]

/**
 * Generic Factory Pattern
 */
interface Constructor<T> {
  new (...args: any[]): T;
}

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args);
}

class Person {
  constructor(public name: string, public age: number) {}
}

const person = createInstance(Person, 'Alice', 25);

/**
 * Generic with Default Types
 */
interface ApiResponse<T = unknown, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
}

const response1: ApiResponse<User> = { data: null, error: null, loading: true };
const response2: ApiResponse = { data: null, error: null, loading: false }; // T = unknown

/**
 * Recursive Generics
 */
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function traverseTree<T>(node: TreeNode<T>, callback: (value: T) => void): void {
  callback(node.value);
  node.children.forEach(child => traverseTree(child, callback));
}

/**
 * Generic Type Inference with Functions
 */

// Infer return type from function
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

function getString(): string { return 'hello'; }
type StringReturn = ReturnTypeOf<typeof getString>; // string

// Infer parameters
type ParametersOf<T> = T extends (...args: infer P) => any ? P : never;

function greetUser(name: string, age: number): void {}
type GreetParams = ParametersOf<typeof greetUser>; // [string, number]

/**
 * Challenge: Implement a type-safe event emitter
 */
type EventMap = {
  click: { x: number; y: number };
  focus: { target: HTMLElement };
  submit: { data: FormData };
};

class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: Partial<{
    [K in keyof Events]: Array<(data: Events[K]) => void>
  }> = {};
  
  on<K extends keyof Events>(event: K, callback: (data: Events[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }
  
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners[event]?.forEach(callback => callback(data));
  }
  
  off<K extends keyof Events>(event: K, callback: (data: Events[K]) => void): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

const emitter = new TypedEventEmitter<EventMap>();

emitter.on('click', ({ x, y }) => {
  console.log(`Clicked at ${x}, ${y}`);
});

emitter.emit('click', { x: 100, y: 200 }); // OK
// emitter.emit('click', { x: 100 }); // Error: missing y
// emitter.emit('click', { x: 100, y: 200, z: 300 }); // Error: excess property
```

---

## Conditional Types

### Question 3: Conditional Type Patterns

```typescript
/**
 * Basic Conditional Types
 */
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false

/**
 * Distributive Conditional Types
 */
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>; // string[] | number[]

// Prevent distribution using tuple
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type Combined = ToArrayNonDistributive<string | number>; // (string | number)[]

/**
 * Infer Keyword
 */

// Extract return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract array element type
type ElementType<T> = T extends (infer E)[] ? E : never;
type NumElement = ElementType<number[]>; // number

// Extract promise value
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type Unwrapped = UnwrapPromise<Promise<string>>; // string

// Deep unwrap promise
type DeepUnwrapPromise<T> = T extends Promise<infer U> 
  ? DeepUnwrapPromise<U> 
  : T;
type DeepUnwrapped = DeepUnwrapPromise<Promise<Promise<Promise<number>>>>; // number

/**
 * Complex Conditional Types
 */

// Extract function arguments by position
type FirstArg<T> = T extends (first: infer F, ...args: any[]) => any ? F : never;
type SecondArg<T> = T extends (first: any, second: infer S, ...args: any[]) => any ? S : never;

function example(a: string, b: number, c: boolean) {}
type First = FirstArg<typeof example>; // string
type Second = SecondArg<typeof example>; // number

// Extract constructor parameters
type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

class MyClass {
  constructor(name: string, age: number) {}
}
type Params = ConstructorParams<typeof MyClass>; // [string, number]

/**
 * Challenge: Type-safe string manipulation
 */
type Split<S extends string, D extends string> = 
  S extends `${infer T}${D}${infer U}` 
    ? [T, ...Split<U, D>] 
    : [S];

type Parts = Split<'a-b-c', '-'>; // ['a', 'b', 'c']

type Join<T extends string[], D extends string> = 
  T extends [] 
    ? '' 
    : T extends [infer F] 
      ? F 
      : T extends [infer F, ...infer R]
        ? F extends string
          ? R extends string[]
            ? `${F}${D}${Join<R, D>}`
            : never
          : never
        : never;

type Joined = Join<['a', 'b', 'c'], '-'>; // 'a-b-c'

/**
 * Exclude and Extract
 */
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type ExcludeExample = MyExclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
type ExtractExample = MyExtract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'

/**
 * NonNullable
 */
type MyNonNullable<T> = T extends null | undefined ? never : T;
type NonNullExample = MyNonNullable<string | null | undefined>; // string
```

---

## Mapped Types

### Question 4: Advanced Mapped Types

```typescript
/**
 * Basic Mapped Types
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P]; // -? removes optional
};

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]; // -readonly removes readonly
};

/**
 * Key Remapping (TypeScript 4.1+)
 */
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type PersonSetters = Setters<Person>;
// { setName: (value: string) => void; setAge: (value: number) => void; }

/**
 * Filter Keys by Type
 */
type FilterByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

interface Mixed {
  name: string;
  age: number;
  active: boolean;
  email: string;
}

type StringProps = FilterByType<Mixed, string>; // { name: string; email: string; }
type NumberProps = FilterByType<Mixed, number>; // { age: number; }

/**
 * Deep Mapped Types
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

interface Nested {
  level1: {
    level2: {
      value: string;
    };
  };
}

type DeepReadonlyNested = DeepReadonly<Nested>;
// All levels are readonly

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};

/**
 * Pick and Omit Implementation
 */
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type MyOmit<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = MyOmit<User, 'password'>; // { id, name, email }
type Credentials = MyPick<User, 'email' | 'password'>; // { email, password }

/**
 * Record Type
 */
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

type PageInfo = MyRecord<'home' | 'about' | 'contact', { title: string }>;

/**
 * Challenge: Create a type that makes specified keys required
 */
type RequireKeys<T, K extends keyof T> = 
  Omit<T, K> & Required<Pick<T, K>>;

interface Config {
  apiUrl?: string;
  timeout?: number;
  debug?: boolean;
}

type RequiredConfig = RequireKeys<Config, 'apiUrl'>;
// { apiUrl: string; timeout?: number; debug?: boolean; }

/**
 * Challenge: Create a type that makes all keys optional except specified ones
 */
type OptionalExcept<T, K extends keyof T> = 
  Partial<Omit<T, K>> & Pick<T, K>;

type MostlyOptional = OptionalExcept<User, 'id'>;
// { id: number; name?: string; email?: string; password?: string; }
```

---

## Template Literal Types

### Question 5: String Type Manipulation

```typescript
/**
 * Basic Template Literal Types
 */
type Greeting = `Hello, ${string}!`;

const greeting: Greeting = 'Hello, World!'; // OK
// const invalid: Greeting = 'Hi, World!'; // Error

/**
 * Union Distribution in Template Literals
 */
type Color = 'red' | 'green' | 'blue';
type Size = 'small' | 'medium' | 'large';

type ColorSize = `${Color}-${Size}`;
// 'red-small' | 'red-medium' | 'red-large' | 'green-small' | ...

/**
 * Built-in String Manipulation Types
 */
type Uppercased = Uppercase<'hello'>; // 'HELLO'
type Lowercased = Lowercase<'HELLO'>; // 'hello'
type Capitalized = Capitalize<'hello'>; // 'Hello'
type Uncapitalized = Uncapitalize<'Hello'>; // 'hello'

/**
 * CSS Property Types
 */
type CSSProperty = 
  | `margin-${'top' | 'right' | 'bottom' | 'left'}`
  | `padding-${'top' | 'right' | 'bottom' | 'left'}`
  | `border-${'top' | 'right' | 'bottom' | 'left'}-${'width' | 'color' | 'style'}`;

const cssProperty: CSSProperty = 'margin-top'; // OK
const cssProperty2: CSSProperty = 'border-left-color'; // OK

/**
 * Event Handler Types
 */
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickHandler = EventName<'click'>; // 'onClick'
type SubmitHandler = EventName<'submit'>; // 'onSubmit'

/**
 * API Route Types
 */
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type APIVersion = 'v1' | 'v2';
type Resource = 'users' | 'posts' | 'comments';

type APIEndpoint = `/api/${APIVersion}/${Resource}`;
// '/api/v1/users' | '/api/v1/posts' | '/api/v2/users' | ...

/**
 * Path Parameter Extraction
 */
type ExtractParams<Path extends string> = 
  Path extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${infer _Start}:${infer Param}`
      ? Param
      : never;

type RouteParams = ExtractParams<'/users/:userId/posts/:postId'>;
// 'userId' | 'postId'

type RouteParamsObject<Path extends string> = {
  [K in ExtractParams<Path>]: string;
};

type UserPostParams = RouteParamsObject<'/users/:userId/posts/:postId'>;
// { userId: string; postId: string; }

/**
 * Challenge: SQL Query Type
 */
type SQLSelect<T extends string> = `SELECT ${T} FROM`;
type SQLWhere<T extends string> = `WHERE ${T}`;

type SelectUsers = SQLSelect<'id, name, email'>; // 'SELECT id, name, email FROM'

/**
 * Challenge: Type-safe i18n keys
 */
interface Translations {
  home: {
    title: string;
    subtitle: string;
  };
  about: {
    header: string;
    content: string;
  };
}

type PathKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? PathKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

type TranslationKeys = PathKeys<Translations>;
// 'home.title' | 'home.subtitle' | 'about.header' | 'about.content'

function translate(key: TranslationKeys): string {
  // Implementation
  return '';
}

translate('home.title'); // OK
// translate('invalid.key'); // Error
```

---

## Type Guards & Narrowing

### Question 6: Type Narrowing Techniques

```typescript
/**
 * typeof Type Guard
 */
function padLeft(value: string | number, padding: string | number): string {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value;
  }
  return padding + value;
}

/**
 * instanceof Type Guard
 */
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

/**
 * in Type Guard
 */
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}

/**
 * Custom Type Guard
 */
interface User {
  type: 'user';
  name: string;
}

interface Admin {
  type: 'admin';
  name: string;
  permissions: string[];
}

function isAdmin(person: User | Admin): person is Admin {
  return person.type === 'admin';
}

function greet(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(`Admin ${person.name} with permissions: ${person.permissions}`);
  } else {
    console.log(`User ${person.name}`);
  }
}

/**
 * Discriminated Unions
 */
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
  }
}

/**
 * Exhaustive Checks
 */
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function getAreaExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
    default:
      return assertNever(shape); // Error if we miss a case
  }
}

/**
 * Assert Functions (TypeScript 3.7+)
 */
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error('Value must be defined');
  }
}

function processValue(value: string | null | undefined) {
  assertIsDefined(value);
  // value is now string
  console.log(value.toUpperCase());
}

/**
 * Challenge: Type-safe API response handler
 */
interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
}

type APIResponse<T> = SuccessResponse<T> | ErrorResponse;

function isSuccess<T>(response: APIResponse<T>): response is SuccessResponse<T> {
  return response.status === 'success';
}

function isError<T>(response: APIResponse<T>): response is ErrorResponse {
  return response.status === 'error';
}

async function fetchUser(): Promise<APIResponse<User>> {
  // Implementation
  return { status: 'success', data: { type: 'user', name: 'John' } };
}

async function handleResponse() {
  const response = await fetchUser();
  
  if (isSuccess(response)) {
    console.log(response.data.name); // TypeScript knows data exists
  } else {
    console.error(response.error.message); // TypeScript knows error exists
  }
}
```

---

## Utility Types Implementation

### Question 7: Implement Built-in Utility Types

```typescript
/**
 * Partial - Make all properties optional
 */
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Required - Make all properties required
 */
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Readonly - Make all properties readonly
 */
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Pick - Pick specified properties
 */
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omit - Omit specified properties
 */
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Record - Create object type with specified keys and value type
 */
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

/**
 * Exclude - Exclude types from union
 */
type MyExclude<T, U> = T extends U ? never : T;

/**
 * Extract - Extract types from union
 */
type MyExtract<T, U> = T extends U ? T : never;

/**
 * NonNullable - Remove null and undefined
 */
type MyNonNullable<T> = T extends null | undefined ? never : T;

/**
 * ReturnType - Extract return type of function
 */
type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;

/**
 * Parameters - Extract parameters as tuple
 */
type MyParameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

/**
 * ConstructorParameters - Extract constructor parameters
 */
type MyConstructorParameters<T extends abstract new (...args: any) => any> = 
  T extends abstract new (...args: infer P) => any ? P : never;

/**
 * InstanceType - Extract instance type from constructor
 */
type MyInstanceType<T extends abstract new (...args: any) => any> = 
  T extends abstract new (...args: any) => infer R ? R : any;

/**
 * Awaited - Extract promised value type
 */
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

/**
 * Additional Utility Types
 */

// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Make specific properties nullable
type Nullable<T> = { [P in keyof T]: T[P] | null };

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep required
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Mutable (remove readonly)
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// Get only function properties
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

// Get only non-function properties
type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

// Merge two types (second overrides first)
type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Testing utility types
 */
interface TestUser {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
  greet: () => void;
}

type PartialUser = MyPartial<TestUser>;
type RequiredUser = MyRequired<TestUser>;
type ReadonlyUser = MyReadonly<TestUser>;
type UserIdName = MyPick<TestUser, 'id' | 'name'>;
type UserWithoutId = MyOmit<TestUser, 'id'>;
type UserFunctions = FunctionKeys<TestUser>; // 'greet'
type UserData = NonFunctionKeys<TestUser>; // 'id' | 'name' | 'email' | 'createdAt'
```

---

## Declaration Files & Module Augmentation

### Question 8: Declaration Files

```typescript
/**
 * Basic Declaration File (.d.ts)
 */
// types/my-library.d.ts
declare module 'my-library' {
  export function doSomething(value: string): number;
  export const version: string;
  
  export interface Options {
    debug?: boolean;
    timeout?: number;
  }
  
  export class Client {
    constructor(options?: Options);
    connect(): Promise<void>;
    disconnect(): void;
  }
  
  export default Client;
}

/**
 * Global Declarations
 */
// types/global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      init: () => void;
    };
  }
  
  interface Array<T> {
    customMethod(): T[];
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      DEBUG?: string;
    }
  }
}

export {}; // Make this a module

/**
 * Module Augmentation
 */
// Augment existing module (e.g., Express)
import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
    requestId: string;
  }
  
  interface Response {
    sendSuccess: <T>(data: T) => void;
    sendError: (code: string, message: string) => void;
  }
}

/**
 * Ambient Module Declaration
 */
// For CSS modules
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// For image imports
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

// For JSON imports
declare module '*.json' {
  const value: any;
  export default value;
}

/**
 * Namespace Declaration
 */
declare namespace API {
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  interface Response<T> {
    data: T;
    status: number;
  }
  
  namespace Endpoints {
    const users: string;
    const posts: string;
  }
}

// Usage
const user: API.User = { id: 1, name: 'John', email: 'john@example.com' };
const endpoint = API.Endpoints.users;

/**
 * Triple-Slash Directives
 */
/// <reference types="node" />
/// <reference path="./types/custom.d.ts" />

/**
 * Declaration Merging
 */
interface Box {
  height: number;
  width: number;
}

interface Box {
  depth: number;
}

// Box now has height, width, and depth

// Merging with namespace
class Album {
  label: Album.AlbumLabel;
}

namespace Album {
  export interface AlbumLabel {
    name: string;
  }
}
```

---

## Advanced Patterns

### Question 9: TypeScript Design Patterns

```typescript
/**
 * Builder Pattern with Types
 */
interface UserBuilder {
  setName(name: string): this;
  setEmail(email: string): this;
  setAge(age: number): this;
  build(): User;
}

interface User {
  name: string;
  email: string;
  age?: number;
}

class TypedUserBuilder implements UserBuilder {
  private user: Partial<User> = {};
  
  setName(name: string): this {
    this.user.name = name;
    return this;
  }
  
  setEmail(email: string): this {
    this.user.email = email;
    return this;
  }
  
  setAge(age: number): this {
    this.user.age = age;
    return this;
  }
  
  build(): User {
    if (!this.user.name || !this.user.email) {
      throw new Error('Name and email are required');
    }
    return this.user as User;
  }
}

// Type-safe builder with required fields
type BuilderMethods<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => BuilderMethods<T> & { build(): T };
};

/**
 * State Machine Pattern
 */
type TrafficLightState = 'green' | 'yellow' | 'red';

type StateTransitions = {
  green: 'yellow';
  yellow: 'red';
  red: 'green';
};

class TrafficLight<S extends TrafficLightState> {
  constructor(private state: S) {}
  
  transition<Next extends StateTransitions[S]>(): TrafficLight<Next> {
    const transitions: Record<TrafficLightState, TrafficLightState> = {
      green: 'yellow',
      yellow: 'red',
      red: 'green'
    };
    return new TrafficLight(transitions[this.state] as Next);
  }
  
  getState(): S {
    return this.state;
  }
}

const light = new TrafficLight('green');
const yellowLight = light.transition(); // TrafficLight<'yellow'>
const redLight = yellowLight.transition(); // TrafficLight<'red'>

/**
 * Singleton Pattern
 */
class Singleton {
  private static instance: Singleton;
  
  private constructor() {}
  
  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

/**
 * Factory Pattern
 */
interface Product {
  name: string;
  price: number;
}

interface ProductFactory {
  create(name: string, price: number): Product;
}

class ElectronicsFactory implements ProductFactory {
  create(name: string, price: number): Product {
    return { name: `Electronics: ${name}`, price: price * 1.2 };
  }
}

class ClothingFactory implements ProductFactory {
  create(name: string, price: number): Product {
    return { name: `Clothing: ${name}`, price };
  }
}

/**
 * Observer Pattern with Types
 */
interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  subscribe(observer: Observer<T>): () => void;
  notify(data: T): void;
}

class TypedSubject<T> implements Subject<T> {
  private observers: Set<Observer<T>> = new Set();
  
  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }
  
  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

/**
 * Command Pattern
 */
interface Command<T = void> {
  execute(): T;
  undo?(): void;
}

class CommandHistory {
  private history: Command[] = [];
  
  execute<T>(command: Command<T>): T {
    const result = command.execute();
    this.history.push(command);
    return result;
  }
  
  undo(): void {
    const command = this.history.pop();
    if (command?.undo) {
      command.undo();
    }
  }
}

/**
 * Repository Pattern
 */
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

abstract class BaseRepository<T extends Entity> implements Repository<T, string> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, entity: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}
```

---

## Real-World Type Challenges

### Question 10: Complex Type Problems

```typescript
/**
 * Challenge 1: Type-safe API Client
 */
interface APIRoutes {
  '/users': {
    GET: { response: User[] };
    POST: { body: CreateUserDTO; response: User };
  };
  '/users/:id': {
    GET: { response: User };
    PUT: { body: UpdateUserDTO; response: User };
    DELETE: { response: void };
  };
  '/posts': {
    GET: { query: { page: number; limit: number }; response: Post[] };
  };
}

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ExtractRouteParams<T extends string> = 
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<`/${Rest}`>]: string }
    : T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : {};

class TypedAPIClient<Routes extends Record<string, any>> {
  constructor(private baseUrl: string) {}
  
  async request<
    Path extends keyof Routes & string,
    Method extends keyof Routes[Path] & HTTPMethod
  >(
    path: Path,
    method: Method,
    options?: {
      params?: ExtractRouteParams<Path>;
      body?: Routes[Path][Method] extends { body: infer B } ? B : never;
      query?: Routes[Path][Method] extends { query: infer Q } ? Q : never;
    }
  ): Promise<Routes[Path][Method] extends { response: infer R } ? R : void> {
    // Implementation
    return {} as any;
  }
}

const client = new TypedAPIClient<APIRoutes>('https://api.example.com');

// Type-safe API calls
const users = await client.request('/users', 'GET');
const user = await client.request('/users/:id', 'GET', { params: { id: '123' } });
const newUser = await client.request('/users', 'POST', { body: { name: 'John', email: 'john@test.com' } });

/**
 * Challenge 2: Deep Object Path Type
 */
type DeepKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? DeepKeyOf<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

type DeepValueOf<T, Path extends string> = 
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? DeepValueOf<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

function get<T, P extends DeepKeyOf<T>>(obj: T, path: P): DeepValueOf<T, P> {
  return path.split('.').reduce((acc: any, key) => acc[key], obj);
}

interface DeepObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'light' | 'dark';
    };
  };
}

const obj: DeepObject = {
  user: { profile: { name: 'John', age: 30 }, settings: { theme: 'dark' } }
};

const name = get(obj, 'user.profile.name'); // string
const age = get(obj, 'user.profile.age'); // number
const theme = get(obj, 'user.settings.theme'); // 'light' | 'dark'

/**
 * Challenge 3: Type-safe Form Builder
 */
type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox';

type FieldConfig<T extends FieldType> = {
  type: T;
  label: string;
  required?: boolean;
} & (T extends 'select' ? { options: string[] } : {});

type FormSchema = Record<string, FieldConfig<FieldType>>;

type FormValues<S extends FormSchema> = {
  [K in keyof S]: S[K]['type'] extends 'number'
    ? number
    : S[K]['type'] extends 'checkbox'
      ? boolean
      : string;
};

function createForm<S extends FormSchema>(schema: S) {
  return {
    schema,
    validate(values: FormValues<S>): boolean {
      // Validation logic
      return true;
    },
    getInitialValues(): FormValues<S> {
      // Get initial values based on schema
      return {} as FormValues<S>;
    }
  };
}

const loginForm = createForm({
  email: { type: 'email', label: 'Email', required: true },
  password: { type: 'password', label: 'Password', required: true },
  rememberMe: { type: 'checkbox', label: 'Remember me' }
});

// Type is inferred correctly
type LoginFormValues = FormValues<typeof loginForm.schema>;
// { email: string; password: string; rememberMe: boolean; }

/**
 * Challenge 4: Tuple manipulation
 */
type TupleToUnion<T extends any[]> = T[number];
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never;
type First<T extends any[]> = T extends [infer F, ...infer _] ? F : never;
type Tail<T extends any[]> = T extends [infer _, ...infer R] ? R : never;
type Init<T extends any[]> = T extends [...infer I, infer _] ? I : never;

type Reverse<T extends any[]> = T extends [infer F, ...infer R] 
  ? [...Reverse<R>, F] 
  : [];

type Concat<A extends any[], B extends any[]> = [...A, ...B];
type Push<T extends any[], V> = [...T, V];
type Unshift<T extends any[], V> = [V, ...T];

// Examples
type Tuple = [1, 2, 3, 4, 5];
type LastElement = Last<Tuple>; // 5
type FirstElement = First<Tuple>; // 1
type Reversed = Reverse<Tuple>; // [5, 4, 3, 2, 1]
```

---

## Summary

These TypeScript questions cover:

1. ✅ **Type System Deep Dive** - Inference, structural typing, branding
2. ✅ **Generics & Constraints** - Advanced generic patterns
3. ✅ **Conditional Types** - Infer, distribution, type extraction
4. ✅ **Mapped Types** - Key remapping, filtering, deep types
5. ✅ **Template Literal Types** - String manipulation, path extraction
6. ✅ **Type Guards & Narrowing** - Custom guards, discriminated unions
7. ✅ **Utility Types** - Implementation from scratch
8. ✅ **Declaration Files** - Module augmentation, ambient modules
9. ✅ **Advanced Patterns** - Design patterns with types
10. ✅ **Real-World Challenges** - Complex type problems

**Tips for TypeScript Interviews**:
- Understand type inference deeply
- Know when to use generics vs overloads
- Master conditional types and `infer`
- Practice implementing utility types
- Understand declaration merging
- Know common design patterns in TypeScript

मालिक, master these TypeScript concepts and you'll excel in senior developer interviews! 🚀
