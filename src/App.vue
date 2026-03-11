<template>
  <div class="app-shell" :class="{ 'light-mode': isLight }">

    <!-- Squares Background -->
    <div class="bg-canvas">
      <Squares
        direction="diagonal"
        :speed="0.5"
        :squareSize="40"
        :borderColor="isLight ? '#e0e0e0' : '#0d0d0d'"
        :hoverFillColor="isLight ? '#f0f0f0' : '#0a0a0a'"
      />
    </div>

    <div class="container">

      <!-- Header -->
      <header class="header fade-down">
        <div class="header-left">
          <span class="logo-mark">◆</span>
          <div>
            <h1 class="title">
              <span
                v-for="(char, index) in 'TASKS'.split('')"
                :key="index"
                class="trail-char"
                :style="{ animationDelay: `${index * 0.08}s` }"
              >{{ char }}</span>
            </h1>
            <p class="subtitle">{{ today }} · <span class="clock">{{ clock }}</span></p>
          </div>
        </div>

        <div class="header-right">
          <button class="theme-toggle" @click="isLight = !isLight" :title="isLight ? 'Dark mode' : 'Light mode'">
            {{ isLight ? '◑' : '◐' }}
          </button>
          <div class="stats">
            <div class="stat">
              <span class="stat-num">{{ remaining }}</span>
              <span class="stat-label">left</span>
            </div>
            <div class="stat-divider">/</div>
            <div class="stat">
              <span class="stat-num">{{ todos.length }}</span>
              <span class="stat-label">total</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Progress Bar -->
      <div class="progress-track fade-in">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>

      <!-- Input -->
      <div class="input-row fade-up">
        <input
          v-model="inputTitle"
          @keydown.enter="handleAdd"
          type="text"
          placeholder="Add a task..."
          class="task-input"
          maxlength="100"
        />
        <button @click="handleAdd" class="add-btn" :disabled="!inputTitle.trim()">+</button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs fade-in-delay">
        <button
          v-for="tab in ['all', 'active', 'done']"
          :key="tab"
          @click="activeFilter = tab"
          class="tab"
          :class="{ 'tab-active': activeFilter === tab }"
        >{{ tab }}</button>
      </div>

      <!-- Todo List -->
      <div class="todo-list">
        <TransitionGroup name="task">
          <div
            v-for="(todo, index) in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :style="{ '--i': index }"
          >
            <button @click="toggleTodo(todo.id)" class="check-btn">
              <span class="check-ring" :class="{ checked: todo.completed }">
                <span v-if="todo.completed" class="check-mark">✓</span>
              </span>
            </button>

            <!-- View mode -->
            <span
              v-if="editingId !== todo.id"
              class="todo-text"
              :class="{ strikethrough: todo.completed }"
              @dblclick="startEdit(todo)"
            >{{ todo.title }}</span>

            <!-- Edit mode -->
            <input
              v-else
              :ref="el => { if (el) editInputRefs[todo.id] = el }"
              v-model="editingText"
              class="todo-edit-input"
              @keydown.enter="saveEdit(todo.id)"
              @keydown.escape="cancelEdit"
              @blur="saveEdit(todo.id)"
              maxlength="100"
            />

            <button
              v-if="editingId !== todo.id"
              @click="startEdit(todo)"
              class="edit-btn"
            >✎</button>
            <button @click="deleteTodo(todo.id)" class="del-btn">×</button>
          </div>
        </TransitionGroup>

        <Transition name="fade">
          <div v-if="filteredTodos.length === 0" class="empty">
            <span class="empty-icon">{{ emptyIcon }}</span>
            <p>{{ emptyText }}</p>
          </div>
        </Transition>
      </div>

      <!-- Clear Completed — desktop: always reserve space, mobile: v-if -->
      <div class="clear-row desktop-clear">
        <button
          @click="clearCompleted"
          class="clear-btn"
          :style="{ visibility: todos.some(t => t.completed) ? 'visible' : 'hidden' }"
        >clear completed</button>
      </div>
      <Transition name="fade">
        <div v-if="todos.some(t => t.completed)" class="clear-row mobile-clear">
          <button @click="clearCompleted" class="clear-btn">clear completed</button>
        </div>
      </Transition>

      <!-- Footer -->
      <footer class="footer fade-footer">
        <span class="footer-copy">© {{ year }} Lance Tinoco.</span>
        <span class="footer-divider">—</span>
        <span class="footer-credit">
          <span class="credit-icon">✦</span>
          Built with Vue.js & Vite
        </span>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Squares from '@/components/Squares.vue'
import { useTodos } from '@/composables/useTodos.js'

const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, updateTodo } = useTodos()

const inputTitle = ref('')
const activeFilter = ref('all')
const clock = ref('')
const isLight = ref(false)

const editingId = ref(null)
const editingText = ref('')
const editInputRefs = {}

function startEdit(todo) {
  if (todo.completed) return
  editingId.value = todo.id
  editingText.value = todo.title
  nextTick(() => {
    const el = editInputRefs[todo.id]
    if (el) {
      el.focus()
      el.select()
    }
  })
}

function saveEdit(id) {
  if (editingId.value !== id) return
  const trimmed = editingText.value.trim()
  if (trimmed) {
    updateTodo(id, trimmed)
  }
  editingId.value = null
  editingText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editingText.value = ''
}

function updateClock() {
  clock.value = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

let clockInterval = null
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})
onBeforeUnmount(() => clearInterval(clockInterval))

const today = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)
const year = computed(() => new Date().getFullYear())
const remaining = computed(() => todos.value.filter(t => !t.completed).length)
const progressWidth = computed(() => {
  if (!todos.value.length) return '0%'
  return `${(todos.value.filter(t => t.completed).length / todos.value.length) * 100}%`
})
const filteredTodos = computed(() => {
  if (activeFilter.value === 'active') return todos.value.filter(t => !t.completed)
  if (activeFilter.value === 'done') return todos.value.filter(t => t.completed)
  return todos.value
})
const emptyIcon = computed(() => {
  if (activeFilter.value === 'done') return '○'
  if (activeFilter.value === 'active') return '◆'
  return '◇'
})
const emptyText = computed(() => {
  if (activeFilter.value === 'done') return 'Nothing completed yet'
  if (activeFilter.value === 'active') return 'All tasks done!'
  return 'No tasks. Add one above.'
})

function handleAdd() {
  if (!inputTitle.value.trim()) return
  addTodo(inputTitle.value)
  inputTitle.value = ''
}
</script>

<style scoped>
/* ─── CSS Variables ──────────────────────────────────────── */
.app-shell {
  --bg:           #080808;
  --surface:      rgba(0, 0, 0, 0.6);
  --border:       #1e1e1e;
  --border-sub:   #1a1a1a;
  --border-faint: #111;
  --text:         #ffffff;
  --text-muted:   #ccc;
  --text-dim:     #444;
  --text-faint:   #333;
  --text-footer:  #555;
  --progress-bg:  #1a1a1a;
  --check-border: #333;
  --empty-icon:   #222;
  --list-max:     290px;
  --scrollbar:    #ffffff;
}

.app-shell.light-mode {
  --bg:           #f4f4f0;
  --surface:      rgba(255, 255, 255, 0.7);
  --border:       #d0d0cc;
  --border-sub:   #ddddd8;
  --border-faint: #e8e8e4;
  --text:         #0a0a0a;
  --text-muted:   #333;
  --text-dim:     #888;
  --text-faint:   #aaa;
  --text-footer:  #999;
  --progress-bg:  #ddddd8;
  --check-border: #bbb;
  --empty-icon:   #ccc;
  --scrollbar:    #0a0a0a;
}

/* ─── Layout ─────────────────────────────────────────────── */
.app-shell {
  min-height: 100vh;
  height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
  transition: background 0.4s ease;
}

.bg-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
}

.container {
  width: 100%;
  max-width: 720px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
}

/* ─── Entry animations ───────────────────────────────────── */
.fade-down { animation: fadeDown 0.6s ease forwards; }
.fade-in { opacity: 0; animation: fadeIn 0.8s 0.2s ease forwards; }
.fade-up { opacity: 0; animation: fadeUp 0.5s 0.3s ease forwards; }
.fade-in-delay { opacity: 0; animation: fadeIn 0.4s 0.4s ease forwards; }
.fade-footer { opacity: 0; animation: fadeUp 0.6s 0.6s ease forwards; }

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─── Header ─────────────────────────────────────────────── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-shrink: 0;
  gap: 1rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.logo-mark {
  font-size: 1.6rem;
  color: var(--text);
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.4s ease;
}
.title {
  font-family: 'Space Mono', monospace;
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.15em;
  line-height: 1;
  display: flex;
  transition: color 0.4s ease;
}
.trail-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  filter: blur(6px);
  animation: trailIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
@keyframes trailIn {
  to { opacity: 1; transform: translateY(0); filter: blur(0px); }
}
.subtitle {
  font-size: clamp(0.65rem, 1.8vw, 0.85rem);
  color: var(--text-dim);
  margin-top: 0.35rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color 0.4s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.clock {
  color: var(--text);
  transition: color 0.4s ease;
}

/* ─── Header Right ───────────────────────────────────────── */
.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}
.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.9rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  flex-shrink: 0;
}
.theme-toggle:hover {
  border-color: var(--text);
  color: var(--text);
}
.stats { display: flex; align-items: center; gap: 0.6rem; }
.stat { text-align: center; }
.stat-num {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: var(--text);
  line-height: 1;
  transition: color 0.4s ease;
}
.stat-label {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: color 0.4s ease;
}
.stat-divider {
  color: var(--border-sub);
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  transition: color 0.4s ease;
}

/* ─── Progress ───────────────────────────────────────────── */
.progress-track {
  height: 1px;
  background: var(--progress-bg);
  margin-bottom: 2rem;
  position: relative;
  flex-shrink: 0;
  transition: background 0.4s ease;
}
.progress-fill {
  position: absolute; top: 0; left: 0;
  height: 100%;
  background: var(--text);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;
}

/* ─── Input ──────────────────────────────────────────────── */
.input-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}
.task-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.9rem 1.2rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, background 0.4s ease, color 0.4s ease;
  backdrop-filter: blur(8px);
  min-width: 0;
}
.task-input::placeholder { color: var(--text-faint); }
.task-input:focus { border-color: var(--text); }
.add-btn {
  background: var(--text);
  color: var(--bg);
  border: none;
  width: 50px;
  flex-shrink: 0;
  font-size: 1.6rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.15s, background 0.4s ease, color 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-btn:hover:not(:disabled) { opacity: 0.85; }
.add-btn:disabled { opacity: 0.2; cursor: not-allowed; }

/* ─── Filter Tabs ────────────────────────────────────────── */
.filter-tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
  transition: border-color 0.4s ease;
}
.tab {
  background: none;
  border: none;
  color: var(--text-faint);
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.7rem, 2vw, 0.82rem);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.5rem 1rem 0.8rem;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}
.tab:hover { color: var(--text-dim); }
.tab-active { color: var(--text); }
.tab-active::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 1px;
  background: var(--text);
}

/* ─── Todo List ──────────────────────────────────────────── */
.todo-list {
  display: flex;
  flex-direction: column;
  height: var(--list-max);
  min-height: var(--list-max);
  max-height: var(--list-max);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  flex-shrink: 0;
  transition: scrollbar-color 0.3s ease;
  position: relative;
}
.todo-list:hover {
  scrollbar-color: var(--scrollbar) transparent;
}
.todo-list::-webkit-scrollbar { width: 2px; }
.todo-list::-webkit-scrollbar-track { background: transparent; }
.todo-list::-webkit-scrollbar-thumb { background: transparent; border-radius: 0; }
.todo-list:hover::-webkit-scrollbar-thumb { background: var(--scrollbar); }

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-faint);
  flex-shrink: 0;
  transition: border-color 0.4s ease;
}
.todo-item:hover .del-btn { opacity: 1; }
.todo-item:hover .edit-btn { opacity: 1; }

.check-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.check-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--check-border);
  transition: all 0.2s;
}
.check-ring.checked { background: var(--text); border-color: var(--text); }
.check-mark { font-size: 0.75rem; color: var(--bg); font-weight: 700; }

.todo-text {
  flex: 1;
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 0.88rem);
  letter-spacing: 0.06em;
  color: var(--text-muted);
  transition: color 0.2s;
  min-width: 0;
  word-break: break-word;
  cursor: text;
}
.strikethrough { text-decoration: line-through; color: var(--text-faint); }

/* ─── Edit Input ─────────────────────────────────────────── */
.todo-edit-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--text);
  color: var(--text);
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 0.88rem);
  letter-spacing: 0.06em;
  outline: none;
  padding: 0 0 2px 0;
  min-width: 0;
  transition: border-color 0.2s, color 0.4s ease;
}

/* ─── Edit Button ────────────────────────────────────────── */
.edit-btn {
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 0.85rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
  padding: 0 0.2rem;
  line-height: 1;
  flex-shrink: 0;
}
.edit-btn:hover { color: var(--text); }

.del-btn {
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
  padding: 0 0.2rem;
  line-height: 1;
  flex-shrink: 0;
}
.del-btn:hover { color: var(--text); }

/* ─── Empty State ────────────────────────────────────────── */
.empty {
  text-align: center;
  padding: 3rem 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.empty-icon {
  display: block;
  font-size: 2rem;
  color: var(--empty-icon);
  margin-bottom: 1rem;
  transition: color 0.4s ease;
}
.empty p {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-faint);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  transition: color 0.4s ease;
}

/* ─── Clear Completed ────────────────────────────────────── */
.clear-row {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: right;
  flex-shrink: 0;
}
.clear-btn {
  background: none;
  border: none;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-faint);
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: underline;
  transition: color 0.2s;
}
.clear-btn:hover { color: var(--text-dim); }
.mobile-clear { display: none; }
.desktop-clear { display: block; }

/* ─── Footer ─────────────────────────────────────────────── */
.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-sub);
  flex-wrap: wrap;
  flex-shrink: 0;
  transition: border-color 0.4s ease;
}
.footer-copy {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: var(--text-footer);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.4s ease;
}
.footer-divider { color: var(--border-sub); font-size: 0.7rem; transition: color 0.4s ease; }
.footer-credit {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  color: var(--text-footer);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.4s ease;
}
.credit-icon { font-size: 0.55rem; }

/* ─── Transitions ────────────────────────────────────────── */
.task-enter-active {
  transition: all 0.10s ease;
  transition-delay: 0.10s;
}
.task-leave-active {
  transition: all 0.3s ease;
  transition-delay: calc(var(--i, 0) * 0.05s);
  position: absolute;
  width: 100%;
}
.task-enter-from { opacity: 0; transform: translateX(-16px); }
.task-leave-to   { opacity: 0; transform: translateX(16px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

/* ─── Mobile ─────────────────────────────────────────────── */
@media (max-width: 480px) {
  .app-shell {
    padding: 1.25rem;
    align-items: flex-start;
    padding-top: 2rem;
    height: 100dvh;
    min-height: 100dvh;
  }
  .container {
    height: calc(100dvh - 3.25rem);
    max-height: none;
  }
  .header { margin-bottom: 1rem; gap: 0.5rem; }
  .header-left { gap: 0.5rem; }
  .logo-mark { font-size: 1rem; }
  .title { font-size: 1.4rem; letter-spacing: 0.1em; }
  .subtitle { white-space: normal; font-size: 0.6rem; }
  .stat-num { font-size: 1.2rem; }
  .stat-label { font-size: 0.55rem; }
  .stat-divider { font-size: 1rem; margin-bottom: 0.3rem; }
  .theme-toggle { width: 26px; height: 26px; font-size: 0.75rem; }
  .del-btn { opacity: 1; }
  .edit-btn { opacity: 1; }
  .todo-list {
    height: auto;
    min-height: 0;
    max-height: none;
    flex: 1;
  }
  .empty {
    justify-content: flex-start;
    padding-top: 3rem;
    padding-bottom: 0;
  }
  .desktop-clear { display: none; }
  .mobile-clear { display: block; }
  .footer {
    margin-top: auto;
    padding-top: 1rem;
    padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  }
}
</style>