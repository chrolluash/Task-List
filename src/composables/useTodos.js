import { ref, watch } from 'vue'
import { supabase } from '@/lib/supabase'

export function useTodos(user) {
  const todos = ref([])
  const loading = ref(true)

  // Refetch when user changes
  watch(user, (val) => {
    if (val) fetchTodos()
    else { todos.value = []; loading.value = false }
  }, { immediate: true })

  async function fetchTodos() {
    loading.value = true
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) { console.error('fetch error:', error); loading.value = false; return }
    todos.value = data
    loading.value = false
  }

  async function addTodo(title) {
    const trimmed = title.trim()
    if (!trimmed) return
    const { data, error } = await supabase
      .from('todos')
      .insert({ title: trimmed, completed: false, description: '', user_id: user.value.id })
      .select()
      .single()
    if (error) { console.error('add error:', error); return }
    todos.value.push(data)
  }

  async function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id)
    if (error) { console.error('toggle error:', error); return }
    todo.completed = !todo.completed
  }

  async function deleteTodo(id) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
    if (error) { console.error('delete error:', error); return }
    todos.value = todos.value.filter(t => t.id !== id)
  }

  async function clearCompleted() {
    const completedIds = todos.value.filter(t => t.completed).map(t => t.id)
    if (!completedIds.length) return
    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', completedIds)
    if (error) { console.error('clear error:', error); return }
    todos.value = todos.value.filter(t => !t.completed)
  }

  async function updateTodo(id, newTitle) {
    const { error } = await supabase
      .from('todos')
      .update({ title: newTitle })
      .eq('id', id)
    if (error) { console.error('update error:', error); return }
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.title = newTitle
  }

  async function updateDescription(id, description) {
    const { error } = await supabase
      .from('todos')
      .update({ description })
      .eq('id', id)
    if (error) { console.error('desc error:', error); return }
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.description = description
  }

  return { todos, loading, addTodo, toggleTodo, deleteTodo, clearCompleted, updateTodo, updateDescription }
}