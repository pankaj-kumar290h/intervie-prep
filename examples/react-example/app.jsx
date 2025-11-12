/**
 * React Todo App
 * Demonstrating Critical Rendering Path with React
 */

const { useState, useEffect, useCallback, useMemo, memo } = React;

/**
 * Performance Info Component
 * Shows CRP-related information
 */
const PerformanceInfo = memo(() => {
  const [firstPaint, setFirstPaint] = useState('calculating...');
  
  useEffect(() => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      setFirstPaint(Math.round(fcp.startTime));
    }
  }, []);
  
  return (
    <div style={{
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '6px',
      marginBottom: '20px',
      fontSize: '12px',
      color: '#555'
    }}>
      <strong>⚡ CRP Info:</strong><br />
      • React bundle must download first<br />
      • Virtual DOM created in memory<br />
      • Reconciliation before actual render<br />
      • First Paint: <span style={{ fontWeight: 'bold' }}>{firstPaint}ms</span>
    </div>
  );
});

/**
 * Todo Item Component
 * Memoized to prevent unnecessary re-renders
 */
const TodoItem = memo(({ todo, onToggle, onDelete }) => {
  return (
    <li style={{
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '10px',
      transition: 'all 0.3s',
      opacity: todo.completed ? 0.6 : 1
    }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{
          width: '20px',
          height: '20px',
          marginRight: '12px',
          cursor: 'pointer'
        }}
      />
      
      <span style={{
        flex: 1,
        color: '#333',
        fontSize: '14px',
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#999' : '#333'
      }}>
        {todo.text}
      </span>
      
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          padding: '6px 12px',
          background: '#ff4757',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}
      >
        Delete
      </button>
    </li>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-render if todo hasn't changed
  return prevProps.todo.id === nextProps.todo.id &&
         prevProps.todo.text === nextProps.todo.text &&
         prevProps.todo.completed === nextProps.todo.completed;
});

/**
 * Statistics Component
 */
const Stats = memo(({ todos }) => {
  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }), [todos]);
  
  return (
    <div style={{
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '2px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#666'
    }}>
      <span>Total: <strong>{stats.total}</strong></span>
      <span>Active: <strong>{stats.active}</strong></span>
      <span>Completed: <strong>{stats.completed}</strong></span>
    </div>
  );
});

/**
 * Main Todo App Component
 */
function TodoApp() {
  // State
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [nextId, setNextId] = useState(1);
  
  // Load todos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('react-todos');
      if (stored) {
        const parsedTodos = JSON.parse(stored);
        setTodos(parsedTodos);
        const maxId = Math.max(...parsedTodos.map(t => t.id), 0);
        setNextId(maxId + 1);
      } else {
        // Initialize with demo todos
        const demoTodos = [
          { id: 1, text: 'Learn React fundamentals', completed: false, createdAt: Date.now() },
          { id: 2, text: 'Understand Virtual DOM', completed: false, createdAt: Date.now() },
          { id: 3, text: 'Master React hooks', completed: false, createdAt: Date.now() },
        ];
        setTodos(demoTodos);
        setNextId(4);
      }
    } catch (e) {
      console.error('Failed to load todos:', e);
    }
    
    console.log('✅ React app mounted and initialized');
  }, []);
  
  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('react-todos', JSON.stringify(todos));
    }
  }, [todos]);
  
  // Add todo
  const addTodo = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    
    setTodos(prev => [...prev, {
      id: nextId,
      text: text,
      completed: false,
      createdAt: Date.now()
    }]);
    
    setNextId(prev => prev + 1);
    setInputValue('');
  }, [inputValue, nextId]);
  
  // Toggle todo
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  // Delete todo
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  // Handle Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  }, [addTodo]);
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '500px',
      padding: '30px',
      margin: '20px'
    }}>
      <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>
        ⚛️ React Todo App
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Demonstrating Critical Rendering Path
      </p>
      
      <PerformanceInfo />
      
      {/* Add todo form */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What needs to be done?"
          autoComplete="off"
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.3s, transform 0.1s'
          }}
        >
          Add
        </button>
      </div>
      
      {/* Todo list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todos.length === 0 ? (
          <li style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999'
          }}>
            No todos yet. Add one above!
          </li>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </ul>
      
      {/* Statistics */}
      <Stats todos={todos} />
    </div>
  );
}

/**
 * Performance Demo Function
 * Shows React's automatic batching and optimization
 */
window.reactPerformanceDemo = function() {
  console.log('🧪 React Performance Demo: Automatic Batching');
  console.log('================================================');
  console.log('React automatically batches state updates within event handlers');
  console.log('Multiple setState calls = Single re-render');
  console.log('');
  console.log('Try adding multiple todos quickly:');
  console.log('React will batch the updates for optimal performance!');
  console.log('');
  console.log('Key React optimizations:');
  console.log('1. Virtual DOM diffing (only updates what changed)');
  console.log('2. Automatic batching (multiple setState = 1 render)');
  console.log('3. React.memo (prevents unnecessary re-renders)');
  console.log('4. useMemo/useCallback (memoizes values and functions)');
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TodoApp />);

console.log('💡 Try: reactPerformanceDemo() to learn about React optimizations');

