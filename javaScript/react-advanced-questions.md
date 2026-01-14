# Advanced React Interview Questions

## Table of Contents
1. [Component Patterns](#component-patterns)
2. [Hooks Deep Dive](#hooks-deep-dive)
3. [State Management](#state-management)
4. [Performance Optimization](#performance-optimization)
5. [Concurrent React](#concurrent-react)
6. [Server Components](#server-components)
7. [Testing Patterns](#testing-patterns)
8. [Custom Hooks](#custom-hooks)
9. [Error Handling](#error-handling)
10. [Architecture Patterns](#architecture-patterns)

---

## Component Patterns

### Question 1: Advanced Component Patterns

```jsx
/**
 * 1. Compound Components Pattern
 * Components that work together to form a complete UI
 */
import React, { createContext, useContext, useState, Children, cloneElement } from 'react';

// Context for sharing state
const TabsContext = createContext();

function Tabs({ children, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  
  return (
    <div className="tab-list" role="tablist">
      {Children.map(children, (child, index) =>
        cloneElement(child, {
          isActive: index === activeIndex,
          onClick: () => setActiveIndex(index),
        })
      )}
    </div>
  );
}

function Tab({ children, isActive, onClick }) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  const { activeIndex } = useContext(TabsContext);
  return (
    <div className="tab-panels">
      {Children.toArray(children)[activeIndex]}
    </div>
  );
}

function TabPanel({ children }) {
  return <div className="tab-panel" role="tabpanel">{children}</div>;
}

// Attach sub-components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// Usage
function TabsExample() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.List>
        <Tabs.Tab>Tab 1</Tabs.Tab>
        <Tabs.Tab>Tab 2</Tabs.Tab>
        <Tabs.Tab>Tab 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel>Content 1</Tabs.Panel>
        <Tabs.Panel>Content 2</Tabs.Panel>
        <Tabs.Panel>Content 3</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}

/**
 * 2. Render Props Pattern
 */
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };
  
  return (
    <div onMouseMove={handleMouseMove} style={{ height: '100vh' }}>
      {render(position)}
    </div>
  );
}

// Usage
function MouseTrackerExample() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div>Mouse position: {x}, {y}</div>
      )}
    />
  );
}

/**
 * 3. Higher-Order Component (HOC)
 */
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    
    if (loading) return <Loading />;
    if (!user) return <Navigate to="/login" />;
    
    return <WrappedComponent {...props} user={user} />;
  };
}

function withErrorBoundary(WrappedComponent, fallback) {
  return class extends React.Component {
    state = { hasError: false };
    
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
      console.error('Error:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        return fallback;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}

/**
 * 4. Controlled vs Uncontrolled Components
 */
// Controlled - React controls the state
function ControlledInput({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// Uncontrolled - DOM controls the state
function UncontrolledInput({ defaultValue, onSubmit }) {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    onSubmit(inputRef.current.value);
  };
  
  return (
    <>
      <input ref={inputRef} defaultValue={defaultValue} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

// Flexible - Supports both controlled and uncontrolled
function FlexibleInput({ value, defaultValue, onChange }) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  
  const actualValue = isControlled ? value : internalValue;
  
  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e.target.value);
  };
  
  return <input value={actualValue} onChange={handleChange} />;
}

/**
 * 5. Polymorphic Components
 */
function Box({ as: Component = 'div', children, ...props }) {
  return <Component {...props}>{children}</Component>;
}

// Usage
function PolymorphicExample() {
  return (
    <>
      <Box>I'm a div</Box>
      <Box as="span">I'm a span</Box>
      <Box as="a" href="/home">I'm a link</Box>
      <Box as={CustomComponent} customProp="value">Custom</Box>
    </>
  );
}
```

---

## Hooks Deep Dive

### Question 2: Understanding React Hooks

```jsx
/**
 * 1. useState - Understanding batching and functional updates
 */
function Counter() {
  const [count, setCount] = useState(0);
  
  // Wrong - uses stale state
  const incrementWrong = () => {
    setCount(count + 1);
    setCount(count + 1); // Still uses original count
  };
  
  // Correct - uses functional update
  const incrementCorrect = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // Uses updated value
  };
  
  // Lazy initialization for expensive computations
  const [expensiveValue] = useState(() => {
    return computeExpensiveValue();
  });
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementCorrect}>Increment</button>
    </div>
  );
}

/**
 * 2. useEffect - Dependencies and cleanup
 */
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: abortController.signal
        });
        
        if (!cancelled) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    // Cleanup function
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [userId]); // Re-run when userId changes
  
  return { data, loading, error };
}

/**
 * 3. useRef - Multiple use cases
 */
function RefExamples() {
  // DOM reference
  const inputRef = useRef(null);
  
  // Mutable value that doesn't trigger re-render
  const renderCount = useRef(0);
  
  // Previous value
  const [value, setValue] = useState('');
  const prevValue = useRef(value);
  
  useEffect(() => {
    prevValue.current = value;
  }, [value]);
  
  // Stable callback reference
  const callbackRef = useRef(() => {});
  callbackRef.current = () => {
    console.log('Current value:', value);
  };
  
  renderCount.current++;
  
  return (
    <div>
      <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />
      <p>Previous: {prevValue.current}</p>
      <p>Render count: {renderCount.current}</p>
      <button onClick={() => callbackRef.current()}>Log</button>
    </div>
  );
}

/**
 * 4. useReducer - Complex state logic
 */
const initialState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all'
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function ItemList() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const fetchItems = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch('/api/items');
      const items = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: items });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };
  
  const filteredItems = useMemo(() => {
    if (state.filter === 'all') return state.items;
    return state.items.filter(item => item.status === state.filter);
  }, [state.items, state.filter]);
  
  return (
    <div>
      {state.loading && <Loading />}
      {state.error && <Error message={state.error} />}
      {filteredItems.map(item => (
        <Item 
          key={item.id} 
          item={item}
          onRemove={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
        />
      ))}
    </div>
  );
}

/**
 * 5. useCallback & useMemo - When to use
 */
function ExpensiveComponent({ items, onItemClick, filter }) {
  // useMemo for expensive calculations
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  // useCallback for stable function references
  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  // DON'T use for simple values
  // const doubled = useMemo(() => count * 2, [count]); // Unnecessary!
  
  return (
    <ul>
      {filteredItems.map(item => (
        <MemoizedItem 
          key={item.id} 
          item={item} 
          onClick={handleClick}
        />
      ))}
    </ul>
  );
}

const MemoizedItem = React.memo(function Item({ item, onClick }) {
  return (
    <li onClick={() => onClick(item.id)}>
      {item.name}
    </li>
  );
});

/**
 * 6. useLayoutEffect vs useEffect
 */
function TooltipExample() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // useLayoutEffect runs synchronously after DOM mutations
  // Use when you need to measure DOM elements before browser paints
  useLayoutEffect(() => {
    if (show && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      setPosition({
        top: buttonRect.bottom + 8,
        left: buttonRect.left + (buttonRect.width - tooltipRect.width) / 2
      });
    }
  }, [show]);
  
  return (
    <>
      <button ref={buttonRef} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        Hover me
      </button>
      {show && (
        <div 
          ref={tooltipRef}
          className="tooltip"
          style={{ position: 'fixed', ...position }}
        >
          Tooltip content
        </div>
      )}
    </>
  );
}
```

---

## State Management

### Question 3: State Management Patterns

```jsx
/**
 * 1. Context + useReducer for Global State
 */
const StateContext = createContext();
const DispatchContext = createContext();

function StateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within StateProvider');
  return context;
}

function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within StateProvider');
  return context;
}

// Selector pattern to prevent unnecessary re-renders
function useSelector(selector) {
  const state = useAppState();
  return useMemo(() => selector(state), [state, selector]);
}

/**
 * 2. Zustand-like Store Implementation
 */
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  
  const getState = () => state;
  
  const setState = (partial) => {
    const nextState = typeof partial === 'function' 
      ? partial(state) 
      : partial;
    
    if (nextState !== state) {
      state = { ...state, ...nextState };
      listeners.forEach(listener => listener(state));
    }
  };
  
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  return { getState, setState, subscribe };
}

// React hook for the store
function useStore(store, selector = state => state) {
  const [state, setState] = useState(() => selector(store.getState()));
  
  useEffect(() => {
    return store.subscribe((newState) => {
      const selected = selector(newState);
      setState(selected);
    });
  }, [store, selector]);
  
  return state;
}

// Usage
const counterStore = createStore({ count: 0 });

function CounterDisplay() {
  const count = useStore(counterStore, state => state.count);
  return <div>Count: {count}</div>;
}

function CounterButtons() {
  return (
    <button onClick={() => counterStore.setState(s => ({ count: s.count + 1 }))}>
      Increment
    </button>
  );
}

/**
 * 3. State Machine with useReducer
 */
const STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

const EVENTS = {
  FETCH: 'FETCH',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  RESET: 'RESET'
};

const transitions = {
  [STATES.IDLE]: {
    [EVENTS.FETCH]: STATES.LOADING
  },
  [STATES.LOADING]: {
    [EVENTS.SUCCESS]: STATES.SUCCESS,
    [EVENTS.ERROR]: STATES.ERROR
  },
  [STATES.SUCCESS]: {
    [EVENTS.RESET]: STATES.IDLE,
    [EVENTS.FETCH]: STATES.LOADING
  },
  [STATES.ERROR]: {
    [EVENTS.RESET]: STATES.IDLE,
    [EVENTS.FETCH]: STATES.LOADING
  }
};

function stateMachineReducer(state, event) {
  const nextState = transitions[state.status]?.[event.type];
  
  if (!nextState) {
    console.warn(`Invalid transition: ${state.status} + ${event.type}`);
    return state;
  }
  
  switch (nextState) {
    case STATES.LOADING:
      return { status: STATES.LOADING, data: null, error: null };
    case STATES.SUCCESS:
      return { status: STATES.SUCCESS, data: event.payload, error: null };
    case STATES.ERROR:
      return { status: STATES.ERROR, data: null, error: event.payload };
    case STATES.IDLE:
      return { status: STATES.IDLE, data: null, error: null };
    default:
      return state;
  }
}

function useStateMachine(asyncFn) {
  const [state, dispatch] = useReducer(stateMachineReducer, {
    status: STATES.IDLE,
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...args) => {
    dispatch({ type: EVENTS.FETCH });
    try {
      const data = await asyncFn(...args);
      dispatch({ type: EVENTS.SUCCESS, payload: data });
      return data;
    } catch (error) {
      dispatch({ type: EVENTS.ERROR, payload: error.message });
      throw error;
    }
  }, [asyncFn]);
  
  const reset = useCallback(() => {
    dispatch({ type: EVENTS.RESET });
  }, []);
  
  return { ...state, execute, reset };
}
```

---

## Performance Optimization

### Question 4: React Performance Techniques

```jsx
/**
 * 1. React.memo with custom comparison
 */
const MemoizedComponent = React.memo(
  function ExpensiveComponent({ data, onClick }) {
    console.log('Rendering ExpensiveComponent');
    return (
      <div onClick={onClick}>
        {data.map(item => <div key={item.id}>{item.name}</div>)}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if data actually changed
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every((item, i) => item.id === nextProps.data[i].id)
    );
  }
);

/**
 * 2. Virtualization for large lists
 */
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="list-item">
      {items[index].name}
    </div>
  );
  
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}

// Custom virtualization hook
function useVirtualization(itemCount, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );
  
  const visibleItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push({
      index: i,
      style: {
        position: 'absolute',
        top: i * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    });
  }
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  return {
    visibleItems,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto',
      position: 'relative'
    },
    contentStyle: {
      height: itemCount * itemHeight,
      position: 'relative'
    },
    handleScroll
  };
}

/**
 * 3. Code Splitting with React.lazy
 */
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./pages/Dashboard'))
  },
  {
    path: '/settings',
    component: React.lazy(() => import('./pages/Settings'))
  }
];

// Preloading components
const preloadComponent = (importFn) => {
  const Component = React.lazy(importFn);
  Component.preload = importFn;
  return Component;
};

const Dashboard = preloadComponent(() => import('./pages/Dashboard'));

// Preload on hover
function NavLink({ to, children }) {
  const handleMouseEnter = () => {
    const route = routes.find(r => r.path === to);
    route?.component.preload?.();
  };
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}

/**
 * 4. Debouncing and Throttling
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useMemo(
    () => debounce((...args) => callbackRef.current(...args), delay),
    [delay]
  );
}

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      // Fetch search results
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

/**
 * 5. Optimizing Context Consumers
 */
// Split contexts by update frequency
const UserContext = createContext();
const ThemeContext = createContext();

// Use context selectors
function useContextSelector(context, selector) {
  const value = useContext(context);
  const selectedValue = selector(value);
  const ref = useRef(selectedValue);
  
  if (!shallowEqual(ref.current, selectedValue)) {
    ref.current = selectedValue;
  }
  
  return ref.current;
}

// Memoize context value
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

/**
 * 6. Preventing Wasted Renders
 */
// Move state down
function App() {
  return (
    <div>
      <Header />
      <ExpensiveTree /> {/* This won't re-render when Counter updates */}
      <Counter /> {/* State is isolated here */}
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Lift content up
function ColorPicker({ children }) {
  const [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      {children} {/* Children don't re-render on color change */}
    </div>
  );
}

function App() {
  return (
    <ColorPicker>
      <ExpensiveTree />
    </ColorPicker>
  );
}
```

---

## Concurrent React

### Question 5: React 18+ Concurrent Features

```jsx
/**
 * 1. useTransition - Non-blocking state updates
 */
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    const value = e.target.value;
    
    // High priority - update input immediately
    setQuery(value);
    
    // Low priority - can be interrupted
    startTransition(() => {
      const filtered = filterLargeDataset(value);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ul style={{ opacity: isPending ? 0.7 : 1 }}>
        {results.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
}

/**
 * 2. useDeferredValue - Deferred rendering
 */
function DeferredSearch({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  
  // This can render with stale value while new results load
  const results = useMemo(
    () => searchItems(deferredQuery),
    [deferredQuery]
  );
  
  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      {results.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
}

/**
 * 3. Suspense for Data Fetching
 */
// Resource pattern
function createResource(promise) {
  let status = 'pending';
  let result;
  
  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    }
  };
}

// Usage with Suspense
const userResource = createResource(fetchUser());

function UserProfile() {
  const user = userResource.read(); // Suspends if not ready
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}

/**
 * 4. SuspenseList for coordinated loading
 */
function ProfilePage() {
  return (
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<Skeleton />}>
        <ProfileHeader />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <ProfileTimeline />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <ProfileFriends />
      </Suspense>
    </SuspenseList>
  );
}

/**
 * 5. Automatic Batching (React 18)
 */
function AutoBatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // React 18 batches ALL state updates automatically
  const handleClick = async () => {
    // These are batched (one re-render)
    setCount(c => c + 1);
    setFlag(f => !f);
    
    // Even in async callbacks!
    await fetch('/api/data');
    
    // These are also batched in React 18
    setCount(c => c + 1);
    setFlag(f => !f);
  };
  
  // To opt out of batching (rare case)
  const handleClickUnbatched = () => {
    flushSync(() => {
      setCount(c => c + 1); // Re-renders immediately
    });
    flushSync(() => {
      setFlag(f => !f); // Re-renders immediately
    });
  };
  
  return <button onClick={handleClick}>Click ({count})</button>;
}

/**
 * 6. useId for SSR-safe IDs
 */
function FormField({ label }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

/**
 * 7. useSyncExternalStore for external stores
 */
function useOnlineStatus() {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // Get snapshot (client)
    () => navigator.onLine,
    // Get server snapshot (SSR)
    () => true
  );
}
```

---

## Server Components

### Question 6: React Server Components

```jsx
/**
 * 1. Server Component (No 'use client' directive)
 */
// app/posts/page.jsx
import { db } from '@/lib/db';
import PostList from './PostList';

// This runs only on the server
async function PostsPage() {
  // Direct database access - no API needed
  const posts = await db.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div>
      <h1>Posts</h1>
      <PostList posts={posts} />
    </div>
  );
}

export default PostsPage;

/**
 * 2. Client Component
 */
'use client';

import { useState } from 'react';

function PostList({ posts }) {
  const [filter, setFilter] = useState('');
  
  const filtered = posts.filter(post => 
    post.title.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter posts..."
      />
      {filtered.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default PostList;

/**
 * 3. Server Actions
 */
// app/actions.js
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  await db.post.create({
    data: { title, content }
  });
  
  revalidatePath('/posts');
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } });
  revalidatePath('/posts');
}

// Usage in Client Component
'use client';

import { createPost } from './actions';

function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create Post</button>
    </form>
  );
}

/**
 * 4. Streaming with Suspense
 */
// app/dashboard/page.jsx
import { Suspense } from 'react';
import Loading from './loading';

async function SlowComponent() {
  const data = await fetchSlowData(); // Takes 3 seconds
  return <div>{data}</div>;
}

async function FastComponent() {
  const data = await fetchFastData(); // Takes 100ms
  return <div>{data}</div>;
}

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Fast component renders first */}
      <Suspense fallback={<Loading />}>
        <FastComponent />
      </Suspense>
      
      {/* Slow component streams in later */}
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}

/**
 * 5. Parallel Data Fetching
 */
async function ParallelFetching() {
  // Fetch in parallel
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  );
}

/**
 * 6. Data Fetching Patterns
 */
// Sequential (waterfall)
async function SequentialPage({ userId }) {
  const user = await getUser(userId);
  const posts = await getPosts(user.id); // Waits for user
  const comments = await getComments(posts[0].id); // Waits for posts
  return <div>...</div>;
}

// Parallel
async function ParallelPage({ userId }) {
  const userPromise = getUser(userId);
  const postsPromise = getPosts(userId);
  
  const [user, posts] = await Promise.all([userPromise, postsPromise]);
  return <div>...</div>;
}

// Preload pattern
import { preload } from 'react-dom';

function preloadUserData(userId) {
  preload(`/api/users/${userId}`, { as: 'fetch' });
}
```

---

## Testing Patterns

### Question 7: React Testing Best Practices

```jsx
/**
 * 1. Component Testing with React Testing Library
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Test component
function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </label>
      {error && <div role="alert">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}

// Tests
describe('LoginForm', () => {
  it('should submit form with email and password', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('should display error message on failure', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});

/**
 * 2. Testing Hooks
 */
import { renderHook, act } from '@testing-library/react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
  
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);
  });
});

/**
 * 3. Mocking API Calls with MSW
 */
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]));
  }),
  
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({ id: 3, ...body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
  it('should fetch and display users', async () => {
    render(<UserList />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });
  
  it('should handle API errors', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

/**
 * 4. Testing with Context
 */
function renderWithProviders(ui, { initialState = {} } = {}) {
  const store = createStore(initialState);
  
  function Wrapper({ children }) {
    return (
      <StoreProvider store={store}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </StoreProvider>
    );
  }
  
  return {
    ...render(ui, { wrapper: Wrapper }),
    store
  };
}

describe('Component with Context', () => {
  it('should access context values', () => {
    renderWithProviders(<UserProfile />, {
      initialState: { user: { name: 'John' } }
    });
    
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});

/**
 * 5. Snapshot Testing
 */
describe('Button', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <Button variant="primary" size="large">
        Click me
      </Button>
    );
    
    expect(container).toMatchSnapshot();
  });
  
  // Inline snapshots
  it('should match inline snapshot', () => {
    const { container } = render(<Button>Click</Button>);
    
    expect(container.innerHTML).toMatchInlineSnapshot(
      `"<button class=\\"btn\\">Click</button>"`
    );
  });
});
```

---

## Custom Hooks

### Question 8: Building Custom Hooks

```jsx
/**
 * 1. useLocalStorage - Persistent state
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

/**
 * 2. useFetch - Data fetching with caching
 */
const cache = new Map();

function useFetch(url, options = {}) {
  const { enabled = true, staleTime = 5000 } = options;
  const [state, dispatch] = useReducer(fetchReducer, {
    data: cache.get(url)?.data ?? null,
    loading: !cache.has(url),
    error: null
  });
  
  useEffect(() => {
    if (!enabled || !url) return;
    
    const cachedEntry = cache.get(url);
    const isStale = !cachedEntry || Date.now() - cachedEntry.timestamp > staleTime;
    
    if (cachedEntry && !isStale) {
      dispatch({ type: 'SUCCESS', payload: cachedEntry.data });
      return;
    }
    
    let cancelled = false;
    const controller = new AbortController();
    
    async function fetchData() {
      dispatch({ type: 'LOADING' });
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (!cancelled) {
          cache.set(url, { data, timestamp: Date.now() });
          dispatch({ type: 'SUCCESS', payload: data });
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          dispatch({ type: 'ERROR', payload: error.message });
        }
      }
    }
    
    fetchData();
    
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, enabled, staleTime]);
  
  const refetch = useCallback(() => {
    cache.delete(url);
    dispatch({ type: 'LOADING' });
  }, [url]);
  
  return { ...state, refetch };
}

/**
 * 3. useIntersectionObserver - Visibility detection
 */
function useIntersectionObserver(options = {}) {
  const { threshold = 0, root = null, rootMargin = '0px' } = options;
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  
  const observer = useRef(null);
  
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );
    
    if (node) observer.current.observe(node);
    
    return () => observer.current?.disconnect();
  }, [node, threshold, root, rootMargin]);
  
  return [setNode, entry];
}

// Usage
function LazyImage({ src, alt }) {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1 });
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    if (entry?.isIntersecting) {
      setLoaded(true);
    }
  }, [entry]);
  
  return (
    <div ref={ref}>
      {loaded ? <img src={src} alt={alt} /> : <Placeholder />}
    </div>
  );
}

/**
 * 4. useMediaQuery - Responsive design
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => 
    window.matchMedia(query).matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

// Usage
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  
  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}

/**
 * 5. useAsync - Async operation handler
 */
function useAsync(asyncFunction, immediate = true) {
  const [state, dispatch] = useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...args) => {
    dispatch({ type: 'pending' });
    try {
      const data = await asyncFunction(...args);
      dispatch({ type: 'resolved', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'rejected', payload: error });
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { ...state, execute };
}

/**
 * 6. usePrevious - Track previous value
 */
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * 7. useClickOutside - Detect outside clicks
 */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  
  useClickOutside(ref, () => setIsOpen(false));
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div className="dropdown-menu">...</div>}
    </div>
  );
}

/**
 * 8. useEventListener - Safe event handling
 */
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);
  
  useLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    
    return () => element.removeEventListener(eventName, eventListener);
  }, [eventName, element]);
}

/**
 * 9. useForm - Form state management
 */
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);
  
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues
  };
}
```

---

## Error Handling

### Question 9: Error Boundaries and Error Handling

```jsx
/**
 * 1. Error Boundary Class Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={this.handleReset}>Try Again</button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

/**
 * 2. useErrorBoundary Hook (for hooks-based error handling)
 */
function useErrorBoundary() {
  const [error, setError] = useState(null);
  
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = useCallback((err) => {
    setError(err);
  }, []);
  
  // Throw error to nearest error boundary
  if (error) throw error;
  
  return { captureError, resetError };
}

// Usage
function ComponentWithErrorHandling() {
  const { captureError } = useErrorBoundary();
  
  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      captureError(error);
    }
  };
  
  return <button onClick={handleClick}>Do Something</button>;
}

/**
 * 3. Async Error Handling Hook
 */
function useAsyncError() {
  const [_, setError] = useState();
  
  return useCallback((error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// Usage in async functions
function AsyncComponent() {
  const throwError = useAsyncError();
  
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetch('/api/data');
        // ...
      } catch (error) {
        throwError(error); // Will be caught by ErrorBoundary
      }
    }
    
    fetchData();
  }, [throwError]);
  
  return <div>...</div>;
}

/**
 * 4. Error Recovery Strategies
 */
function ErrorRecoveryExample() {
  const [key, setKey] = useState(0);
  
  const handleReset = () => {
    // Reset by changing key forces remount
    setKey(prev => prev + 1);
  };
  
  return (
    <ErrorBoundary
      key={key}
      fallback={(error, reset) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={reset}>Retry</button>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )}
      onReset={handleReset}
    >
      <ProblematicComponent />
    </ErrorBoundary>
  );
}

/**
 * 5. Granular Error Boundaries
 */
function Dashboard() {
  return (
    <div className="dashboard">
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget1 />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget2 />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<WidgetError />}>
        <Widget3 />
      </ErrorBoundary>
    </div>
  );
}

/**
 * 6. Error Boundary with Retry Logic
 */
class RetryErrorBoundary extends React.Component {
  state = { hasError: false, retryCount: 0 };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      retryCount: prev.retryCount + 1
    }));
  };
  
  render() {
    const { hasError, retryCount } = this.state;
    const { maxRetries = 3, children, fallback } = this.props;
    
    if (hasError) {
      if (retryCount < maxRetries) {
        return (
          <div>
            <p>Something went wrong</p>
            <button onClick={this.handleRetry}>
              Retry ({maxRetries - retryCount} attempts remaining)
            </button>
          </div>
        );
      }
      
      return fallback || <div>Failed after {maxRetries} retries</div>;
    }
    
    return children;
  }
}
```

---

## Architecture Patterns

### Question 10: React Application Architecture

```jsx
/**
 * 1. Feature-Based Architecture
 */
// src/
//   features/
//     auth/
//       components/
//       hooks/
//       api.js
//       slice.js
//       types.ts
//     products/
//       components/
//       hooks/
//       api.js
//       slice.js
//   shared/
//     components/
//     hooks/
//     utils/
//   app/
//     store.js
//     routes.js

// Feature module pattern
// features/auth/index.js
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export { authReducer } from './slice';
export * from './types';

/**
 * 2. Container/Presentational Pattern
 */
// Container - handles logic
function UserListContainer() {
  const { data: users, loading, error } = useFetch('/api/users');
  const [filter, setFilter] = useState('');
  
  const filteredUsers = useMemo(() => 
    users?.filter(u => u.name.includes(filter)) ?? [],
    [users, filter]
  );
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <UserList 
      users={filteredUsers}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}

// Presentational - handles UI
function UserList({ users, filter, onFilterChange }) {
  return (
    <div>
      <input value={filter} onChange={e => onFilterChange(e.target.value)} />
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}

/**
 * 3. Repository Pattern for Data Access
 */
// repositories/userRepository.js
const userRepository = {
  async findAll() {
    const response = await api.get('/users');
    return response.data;
  },
  
  async findById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  async create(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  async update(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  async delete(id) {
    await api.delete(`/users/${id}`);
  }
};

// Usage in hooks
function useUsers() {
  return useQuery(['users'], userRepository.findAll);
}

function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation(userRepository.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    }
  });
}

/**
 * 4. Composition over Props Drilling
 */
// Instead of drilling props
function BadExample() {
  const user = useUser();
  return <Layout user={user}><Content user={user} /></Layout>;
}

// Use composition
function GoodExample() {
  const user = useUser();
  
  return (
    <Layout>
      <Header>
        <UserAvatar user={user} />
      </Header>
      <Content>
        <UserProfile user={user} />
      </Content>
    </Layout>
  );
}

/**
 * 5. Module System
 */
// modules/index.js
export const modules = {
  auth: {
    routes: [
      { path: '/login', component: LoginPage },
      { path: '/register', component: RegisterPage }
    ],
    reducer: authReducer,
    middleware: [authMiddleware]
  },
  products: {
    routes: [
      { path: '/products', component: ProductsPage },
      { path: '/products/:id', component: ProductDetailPage }
    ],
    reducer: productsReducer
  }
};

// Dynamic module registration
function registerModule(name, module) {
  store.injectReducer(name, module.reducer);
  router.addRoutes(module.routes);
  module.middleware?.forEach(m => store.addMiddleware(m));
}

/**
 * 6. Dependency Injection with Context
 */
// Services context
const ServicesContext = createContext();

const services = {
  api: new ApiService(),
  auth: new AuthService(),
  analytics: new AnalyticsService(),
  storage: new StorageService()
};

function ServicesProvider({ children, overrides = {} }) {
  const value = useMemo(() => ({
    ...services,
    ...overrides
  }), [overrides]);
  
  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

function useService(name) {
  const services = useContext(ServicesContext);
  return services[name];
}

// Usage
function UserProfile() {
  const api = useService('api');
  const analytics = useService('analytics');
  
  useEffect(() => {
    analytics.track('view_profile');
  }, [analytics]);
  
  // ...
}

// Testing with mock services
function renderWithMocks(ui) {
  return render(
    <ServicesProvider overrides={{
      api: mockApi,
      analytics: mockAnalytics
    }}>
      {ui}
    </ServicesProvider>
  );
}
```

---

## Summary

These React questions cover:

1. ✅ **Component Patterns** - Compound, Render Props, HOC, Polymorphic
2. ✅ **Hooks Deep Dive** - useState, useEffect, useReducer, useMemo
3. ✅ **State Management** - Context, Zustand-like, State Machines
4. ✅ **Performance Optimization** - Memo, Virtualization, Code Splitting
5. ✅ **Concurrent React** - Transitions, Suspense, Streaming
6. ✅ **Server Components** - RSC, Server Actions, Data Fetching
7. ✅ **Testing Patterns** - RTL, MSW, Hook Testing
8. ✅ **Custom Hooks** - Reusable hook patterns
9. ✅ **Error Handling** - Error Boundaries, Recovery
10. ✅ **Architecture Patterns** - Feature-based, DI, Module System

**Tips for React Interviews**:
- Understand React's rendering behavior deeply
- Know when to use useCallback/useMemo (and when not to)
- Be familiar with React 18+ features
- Practice explaining component lifecycle
- Know common performance pitfalls
- Understand Server Components architecture

मालिक, master these React concepts and dominate your frontend interviews! 🚀
