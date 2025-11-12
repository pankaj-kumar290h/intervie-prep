/**
 * Vanilla JavaScript Todo App
 * Demonstrating efficient DOM manipulation for Critical Rendering Path
 */

// State management
let todos = [];
let nextId = 1;

// DOM element references (cached for performance)
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');

/**
 * Initialize the app
 */
function init() {
  // Load todos from localStorage
  loadTodosFromStorage();
  
  // Set up event listeners
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // Render initial todos
  render();
  
  console.log('✅ Vanilla JS app initialized');
}

/**
 * Add a new todo
 */
function addTodo() {
  const text = todoInput.value.trim();
  
  if (!text) {
    todoInput.focus();
    return;
  }
  
  // Add to state
  todos.push({
    id: nextId++,
    text: text,
    completed: false,
    createdAt: Date.now()
  });
  
  // Clear input
  todoInput.value = '';
  todoInput.focus();
  
  // Save and render
  saveTodosToStorage();
  render();
}

/**
 * Toggle todo completion
 */
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodosToStorage();
    render();
  }
}

/**
 * Delete a todo
 */
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodosToStorage();
  render();
}

/**
 * Render the todo list
 * Using efficient DOM manipulation techniques
 */
function render() {
  // Performance optimization: Use DocumentFragment for batch updates
  const fragment = document.createDocumentFragment();
  
  if (todos.length === 0) {
    // Show empty state
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-state';
    emptyLi.textContent = 'No todos yet. Add one above!';
    fragment.appendChild(emptyLi);
  } else {
    // Render todos
    todos.forEach(todo => {
      const li = createTodoElement(todo);
      fragment.appendChild(li);
    });
  }
  
  // Single DOM update (minimizes reflow)
  todoList.innerHTML = '';
  todoList.appendChild(fragment);
  
  // Update statistics
  updateStats();
}

/**
 * Create a todo element
 * Demonstrates efficient element creation
 */
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = todo.id;
  
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => toggleTodo(todo.id));
  
  // Text
  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
  
  // Assemble
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  
  return li;
}

/**
 * Update statistics
 * Demonstrates efficient DOM updates
 */
function updateStats() {
  const total = todos.length;
  const active = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  
  // Batch DOM updates
  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
}

/**
 * Save todos to localStorage
 */
function saveTodosToStorage() {
  try {
    localStorage.setItem('vanilla-todos', JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos:', e);
  }
}

/**
 * Load todos from localStorage
 */
function loadTodosFromStorage() {
  try {
    const stored = localStorage.getItem('vanilla-todos');
    if (stored) {
      todos = JSON.parse(stored);
      // Update nextId based on loaded todos
      nextId = Math.max(...todos.map(t => t.id), 0) + 1;
    }
  } catch (e) {
    console.error('Failed to load todos:', e);
    todos = [];
  }
}

/**
 * Performance monitoring
 */
function measurePerformance() {
  // Measure function execution time
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      return duration;
    }
  };
}

/**
 * Demo: Show performance of batch vs individual updates
 */
function performanceDemo() {
  console.log('🧪 Performance Demo: Batch vs Individual Updates');
  console.log('================================================');
  
  // Individual updates (BAD)
  const timer1 = measurePerformance();
  for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = `Item ${i}`;
    todoList.appendChild(div); // Each append causes reflow!
  }
  const time1 = timer1.end();
  todoList.innerHTML = ''; // Clean up
  
  // Batch updates (GOOD)
  const timer2 = measurePerformance();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = `Item ${i}`;
    fragment.appendChild(div); // No reflow
  }
  todoList.appendChild(fragment); // Single reflow!
  const time2 = timer2.end();
  todoList.innerHTML = ''; // Clean up
  
  console.log(`❌ Individual updates (100 items): ${time1.toFixed(2)}ms`);
  console.log(`✅ Batch updates (100 items): ${time2.toFixed(2)}ms`);
  console.log(`🚀 Performance improvement: ${(time1 / time2).toFixed(1)}x faster`);
  
  // Restore original content
  render();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add some demo todos if empty
if (todos.length === 0) {
  todos = [
    { id: nextId++, text: 'Learn about Critical Rendering Path', completed: false, createdAt: Date.now() },
    { id: nextId++, text: 'Understand blocking vs non-blocking resources', completed: false, createdAt: Date.now() },
    { id: nextId++, text: 'Optimize my website performance', completed: false, createdAt: Date.now() },
  ];
  saveTodosToStorage();
  render();
}

// Export for console debugging
window.todoApp = {
  todos,
  addTodo,
  toggleTodo,
  deleteTodo,
  render,
  performanceDemo
};

console.log('💡 Try: todoApp.performanceDemo() to see batch vs individual updates');

