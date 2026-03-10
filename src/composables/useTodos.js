import { ref, watch } from 'vue'

const STORAGE_KEY = 'tasks-app-todos'

export function useTodos() {
  const stored = localStorage.getItem(STORAGE_KEY)
  const todos = ref(stored ? JSON.parse(stored) : [])

  watch(todos, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  let nextId = Date.now()

  function addTodo(title) {
    const trimmed = title.trim()
    if (!trimmed) return
    todos.value.push({ id: ++nextId, title: trimmed, completed: false })
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function clearCompleted() {
    todos.value = todos.value.filter(t => !t.completed)
  }

  return { todos, addTodo, toggleTodo, deleteTodo, clearCompleted }
}