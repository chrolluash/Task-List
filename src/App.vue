<template>
  <div class="app-shell" :class="{ 'light-mode': isLight }">

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

      <header class="header fade-down">
        <div class="header-left">
          <button v-if="user" class="hamburger mobile-only" @click="sidebarOpen = !sidebarOpen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span class="logo-mark desktop-only">◆</span>
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
          <button class="header-icon-btn theme-toggle desktop-only" @click="isLight = !isLight" :title="isLight ? 'Dark mode' : 'Light mode'">
            {{ isLight ? '◑' : '◐' }}
          </button>

          <Transition name="fade" mode="out-in">
            <button v-if="!user" key="login" class="header-icon-btn desktop-only" @click="showAuth = true" title="Sign in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </button>
            <button v-else key="profile" class="header-icon-btn desktop-only" @click="showProfile = true" title="Profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </Transition>

          <button v-if="!user" class="header-icon-btn mobile-only" @click="showAuth = true" title="Sign in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
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

      <div class="progress-track fade-in">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>

      <div class="input-row fade-up">
        <input
          v-model="inputTitle"
          @keydown.enter="handleAdd"
          type="text"
          placeholder="Add a task..."
          class="task-input"
          maxlength="100"
          :disabled="todosLoading"
        />
        <button @click="handleAdd" class="add-btn" :disabled="!inputTitle.trim() || todosLoading">+</button>
      </div>

      <div class="filter-tabs fade-in-delay">
        <Transition name="bar-swap" mode="out-in">
          <div v-if="!deleteMode" key="tabs" class="tabs-inner">
            <button
              v-for="tab in ['all', 'active', 'done']"
              :key="tab"
              @click="activeFilter = tab"
              class="tab"
              :class="{ 'tab-active': activeFilter === tab }"
            >{{ tab }}</button>
          </div>
          <div v-else key="delete-actions" class="delete-actions-inner">
            <span class="delete-hint">
              {{ selectedIds.size === 0 ? 'Select tasks to delete' : `${selectedIds.size} selected` }}
            </span>
            <div class="delete-action-btns">
              <button class="del-action-cancel" @click="cancelDeleteMode">Cancel</button>
              <button class="del-action-confirm" :disabled="selectedIds.size === 0" @click="confirmDelete">
                Delete {{ selectedIds.size > 0 ? `(${selectedIds.size})` : '' }}
              </button>
            </div>
          </div>
        </Transition>

        <Transition name="trash-btn">
          <button v-if="!deleteMode" class="delete-mode-btn" @click="toggleDeleteMode" title="Select to delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </Transition>
      </div>

      <div class="todo-list">
        <Transition name="skeleton-fade">
          <div v-if="todosLoading" class="skeleton-list">
            <div v-for="i in 4" :key="i" class="skeleton-row" :style="{ '--delay': `${(i - 1) * 0.06}s` }">
              <div class="skeleton-check"></div>
              <div class="skeleton-content"><div class="skeleton-line" :style="{ width: `${55 + (i * 11) % 35}%` }"></div></div>
              <div class="skeleton-note"></div>
            </div>
          </div>
        </Transition>

        <Transition name="skeleton-fade">
          <div v-if="!todosLoading" class="real-list">
            <TransitionGroup name="task" appear>
              <div
                v-for="(todo, index) in filteredTodos"
                :key="todo.id"
                class="todo-item"
                :class="{ 'is-selected': selectedIds.has(todo.id), 'is-delete-mode': deleteMode }"
                :style="{ '--i': index }"
              >
                <div class="todo-ctrl">
                  <Transition name="ctrl-swap" mode="out-in">
                    <span
                      v-if="deleteMode"
                      key="checkbox"
                      class="todo-checkbox"
                      :class="{ checked: selectedIds.has(todo.id) }"
                      @click="toggleSelect(todo.id)"
                    >
                      <Transition name="check-pop">
                        <span v-if="selectedIds.has(todo.id)" class="checkbox-mark">✓</span>
                      </Transition>
                    </span>
                    <button v-else key="checkring" class="check-btn" @click.stop="toggleTodo(todo.id)">
                      <span class="check-ring" :class="{ checked: todo.completed }">
                        <span v-if="todo.completed" class="check-mark">✓</span>
                      </span>
                    </button>
                  </Transition>
                </div>
                <div class="todo-main" @click="deleteMode ? toggleSelect(todo.id) : openTaskModal(todo)">
                  <div class="todo-title-row">
                    <span class="todo-text" :class="{ strikethrough: todo.completed }">{{ todo.title }}</span>
                    <span v-if="!todo.description && !deleteMode" class="todo-desc-hint">+ note</span>
                  </div>
                  <p v-if="todo.description && !deleteMode" class="todo-desc-preview">{{ todo.description }}</p>
                </div>
              </div>
            </TransitionGroup>

            <Transition name="empty-anim">
              <div v-if="filteredTodos.length === 0" class="empty">
                <span class="empty-icon">{{ emptyIcon }}</span>
                <p>{{ emptyText }}</p>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>

      <div class="clear-row desktop-clear">
        <button class="clear-btn" @click="clearCompleted" :style="{ visibility: !deleteMode && todos.some(t => t.completed) ? 'visible' : 'hidden' }">clear completed</button>
      </div>
      <Transition name="fade">
        <div v-if="!deleteMode && todos.some(t => t.completed)" class="clear-row mobile-clear">
          <button class="clear-btn" @click="clearCompleted">clear completed</button>
        </div>
      </Transition>

      <footer class="footer fade-footer">
        <span class="footer-copy">© {{ year }} Lance Tinoco.</span>
        <span class="footer-divider">—</span>
        <span class="footer-credit"><span class="credit-icon">✦</span> Built with Vue.js & Vite</span>
      </footer>

    </div>

    <TaskModal :todo="activeTodo" @close="activeTodo = null" @save="handleTaskSave" />
    <AuthModal :show="showAuth" @close="showAuth = false" @success="handleAuthSuccess" />
    <ProfileModal :show="showProfile" :user="user" :profile="profile" @close="showProfile = false" />

    <MobileSidebar
      :open="sidebarOpen"
      :user="user"
      :profile="profile"
      :is-light="isLight"
      :remaining="remaining"
      :total="todos.length"
      :done="todos.filter(t => t.completed).length"
      @close="sidebarOpen = false"
      @toggle-theme="isLight = !isLight"
    />

    <!-- Patch Notes — pops up 1.5s after mount, once per version -->
    <PatchNotes :show="showPatchNotes" @close="closePatchNotes" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Squares from '@/components/Squares.vue'
import TaskModal from '@/components/TaskModal.vue'
import AuthModal from '@/components/AuthModal.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import MobileSidebar from '@/components/MobileSidebar.vue'
import PatchNotes from '@/components/PatchNotes.vue'
import { useTodos } from '@/composables/useTodos.js'
import { useAuth } from '@/composables/useAuth.js'

const PATCH_VERSION = 'v3.0.0'

const { user, profile } = useAuth()
const { todos, loading: todosLoading, addTodo, toggleTodo, deleteTodo, clearCompleted, updateTodo, updateDescription } = useTodos(user)

const inputTitle = ref('')
const activeFilter = ref('all')
const clock = ref('')
const isLight = ref(false)
const deleteMode = ref(false)
const selectedIds = ref(new Set())
const showAuth = ref(false)
const showProfile = ref(false)
const sidebarOpen = ref(false)
const activeTodo = ref(null)
const pendingTitle = ref('')
const showPatchNotes = ref(false)

let patchTimeout = null

function closePatchNotes() {
  showPatchNotes.value = false
  localStorage.setItem('seen_patch', PATCH_VERSION)
}

function openTaskModal(todo) { activeTodo.value = todo }

function handleTaskSave({ id, title, description }) {
  updateTodo(id, title)
  updateDescription(id, description)
  activeTodo.value = null
}

function handleAuthSuccess() {
  showAuth.value = false
  if (pendingTitle.value) {
    addTodo(pendingTitle.value)
    pendingTitle.value = ''
  }
}

function handleAdd() {
  const trimmed = inputTitle.value.trim()
  if (!trimmed) return
  if (!user.value) { pendingTitle.value = trimmed; inputTitle.value = ''; showAuth.value = true; return }
  addTodo(trimmed)
  inputTitle.value = ''
}

function toggleDeleteMode() { deleteMode.value = !deleteMode.value; selectedIds.value = new Set() }
function cancelDeleteMode() { deleteMode.value = false; selectedIds.value = new Set() }
function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}
function confirmDelete() { selectedIds.value.forEach(id => deleteTodo(id)); cancelDeleteMode() }

function onKeydown(e) {
  if (e.key === 'Escape') {
    activeTodo.value = null
    showAuth.value = false
    showProfile.value = false
    sidebarOpen.value = false
    showPatchNotes.value = false
    cancelDeleteMode()
  }
}

function updateClock() {
  clock.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

let clockInterval = null
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
  window.addEventListener('keydown', onKeydown)

  // Show patch notes 1.5s after load, only once per version
  if (localStorage.getItem('seen_patch') !== PATCH_VERSION) {
    patchTimeout = setTimeout(() => {
      showPatchNotes.value = true
    }, 1500)
  }
})
onBeforeUnmount(() => {
  clearInterval(clockInterval)
  clearTimeout(patchTimeout)
  window.removeEventListener('keydown', onKeydown)
})

const today = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
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
  if (!user.value) return '◈'
  if (activeFilter.value === 'done') return '○'
  if (activeFilter.value === 'active') return '◆'
  return '◇'
})
const emptyText = computed(() => {
  const name = profile.value?.username || user.value?.email?.split('@')[0] || null
  if (!user.value) return 'Sign in to save your tasks'
  if (activeFilter.value === 'done') return name ? `Nothing completed yet, ${name}` : 'Nothing completed yet'
  if (activeFilter.value === 'active') return name ? `Great job ${name}, all done!` : 'All tasks done!'
  return name ? `Hi ${name}, no tasks for today` : 'No tasks. Add one above.'
})
</script>

<style scoped>
.app-shell {
  --bg:            #080808;
  --surface:       rgba(0, 0, 0, 0.6);
  --border:        #1e1e1e;
  --border-sub:    #1a1a1a;
  --border-faint:  #111;
  --text:          #ffffff;
  --text-muted:    #ccc;
  --text-dim:      #444;
  --text-faint:    #333;
  --text-footer:   #555;
  --progress-bg:   #1a1a1a;
  --check-border:  #333;
  --empty-icon:    #222;
  --list-max:      290px;
  --scrollbar:     #ffffff;
  --modal-bg:      #0f0f0f;
  --modal-border:  #222;
  --danger:        #ff4444;
  --ctrl-size:     24px;
  --skeleton-bg:   #1a1a1a;
}
.app-shell.light-mode {
  --bg:            #f4f4f0;
  --surface:       rgba(255, 255, 255, 0.7);
  --border:        #d0d0cc;
  --border-sub:    #ddddd8;
  --border-faint:  #e8e8e4;
  --text:          #0a0a0a;
  --text-muted:    #333;
  --text-dim:      #888;
  --text-faint:    #aaa;
  --text-footer:   #999;
  --progress-bg:   #ddddd8;
  --check-border:  #bbb;
  --empty-icon:    #ccc;
  --scrollbar:     #0a0a0a;
  --modal-bg:      #fafaf6;
  --modal-border:  #d0d0cc;
  --danger:        #cc2222;
  --skeleton-bg:   #e0e0dc;
}

.app-shell { min-height: 100vh; height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 2rem; font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden; transition: background 0.4s ease; }
.bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
.container { width: 100%; max-width: 720px; position: relative; z-index: 1; display: flex; flex-direction: column; max-height: calc(100vh - 4rem); overflow: hidden; }

.fade-down { animation: fadeDown 0.6s ease forwards; }
.fade-in { opacity: 0; animation: fadeIn 0.8s 0.2s ease forwards; }
.fade-up { opacity: 0; animation: fadeUp 0.5s 0.3s ease forwards; }
.fade-in-delay { opacity: 0; animation: fadeIn 0.4s 0.4s ease forwards; }
.fade-footer { opacity: 0; animation: fadeUp 0.6s 0.6s ease forwards; }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-shrink: 0; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.logo-mark { font-size: 1.6rem; color: var(--text); line-height: 1; flex-shrink: 0; transition: color 0.4s ease; }
.title { font-family: 'Space Mono', monospace; font-size: clamp(1.8rem, 5vw, 3rem); font-weight: 700; color: var(--text); letter-spacing: 0.15em; line-height: 1; display: flex; transition: color 0.4s ease; }
.trail-char { display: inline-block; opacity: 0; transform: translateY(20px); filter: blur(6px); animation: trailIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
@keyframes trailIn { to { opacity: 1; transform: translateY(0); filter: blur(0px); } }
.subtitle { font-size: clamp(0.65rem, 1.8vw, 0.85rem); color: var(--text-dim); margin-top: 0.35rem; letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.4s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clock { color: var(--text); transition: color 0.4s ease; }

.header-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
.header-icon-btn { background: none; border: 1px solid var(--border); color: var(--text-dim); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; padding: 0; }
.header-icon-btn:hover { border-color: var(--text); color: var(--text); }
.theme-toggle { font-size: 0.9rem; line-height: 1; }
.hamburger { background: none; border: none; color: var(--text-dim); display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0.25rem; transition: color 0.2s; flex-shrink: 0; }
.hamburger:hover { color: var(--text); }
.mobile-only { display: none; }
.desktop-only { display: flex; }

.stats { display: flex; align-items: center; gap: 0.6rem; }
.stat { text-align: center; }
.stat-num { display: block; font-family: 'Space Mono', monospace; font-size: clamp(1.4rem, 4vw, 2rem); color: var(--text); line-height: 1; transition: color 0.4s ease; }
.stat-label { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; transition: color 0.4s ease; }
.stat-divider { color: var(--border-sub); font-size: 1.4rem; margin-bottom: 0.5rem; transition: color 0.4s ease; }

.progress-track { height: 1px; background: var(--progress-bg); margin-bottom: 2rem; position: relative; flex-shrink: 0; transition: background 0.4s ease; }
.progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--text); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease; }

.input-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-shrink: 0; }
.task-input { flex: 1; background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.9rem 1.2rem; font-family: 'DM Sans', sans-serif; font-size: 1rem; outline: none; transition: border-color 0.2s, background 0.4s ease, color 0.4s ease; backdrop-filter: blur(8px); min-width: 0; }
.task-input::placeholder { color: var(--text-faint); }
.task-input:focus { border-color: var(--text); }
.task-input:disabled { opacity: 0.4; cursor: not-allowed; }
.add-btn { background: var(--text); color: var(--bg); border: none; width: 50px; flex-shrink: 0; font-size: 1.6rem; font-weight: 300; cursor: pointer; transition: all 0.15s, background 0.4s ease, color 0.4s ease; display: flex; align-items: center; justify-content: center; }
.add-btn:hover:not(:disabled) { opacity: 0.85; }
.add-btn:disabled { opacity: 0.2; cursor: not-allowed; }

.filter-tabs { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-sub); flex-shrink: 0; min-height: 42px; transition: border-color 0.4s ease; overflow: visible; }
.tabs-inner { display: flex; flex: 1; }
.tab { background: none; border: none; color: var(--text-faint); font-family: 'Space Mono', monospace; font-size: clamp(0.7rem, 2vw, 0.82rem); letter-spacing: 0.1em; text-transform: uppercase; padding: 0.5rem 1rem 0.8rem; cursor: pointer; position: relative; transition: color 0.2s; }
.tab:hover { color: var(--text-dim); }
.tab-active { color: var(--text); }
.tab-active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: var(--text); }
.delete-mode-btn { background: none; border: none; color: var(--text-muted); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-bottom: 0.4rem; padding: 0; transition: color 0.2s ease; }
.delete-mode-btn:hover { color: var(--danger); }
.delete-actions-inner { display: flex; align-items: center; justify-content: space-between; flex: 1; padding-bottom: 0.8rem; }
.delete-hint { font-family: 'Space Mono', monospace; font-size: 0.72rem; letter-spacing: 0.08em; color: var(--text-dim); text-transform: uppercase; }
.delete-action-btns { display: flex; gap: 0.6rem; }
.del-action-cancel { background: none; border: 1px solid var(--border); color: var(--text-dim); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.4rem 0.9rem; cursor: pointer; transition: all 0.15s; }
.del-action-cancel:hover { border-color: var(--text-dim); color: var(--text); }
.del-action-confirm { background: var(--danger); border: 1px solid var(--danger); color: #fff; font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.4rem 0.9rem; cursor: pointer; transition: all 0.15s; }
.del-action-confirm:hover:not(:disabled) { opacity: 0.8; }
.del-action-confirm:disabled { opacity: 0.25; cursor: not-allowed; }

.todo-list { height: var(--list-max); min-height: var(--list-max); max-height: var(--list-max); position: relative; flex-shrink: 0; }
.skeleton-list { position: absolute; inset: 0; display: flex; flex-direction: column; }
.skeleton-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--border-faint); opacity: 0; animation: skelIn 0.3s ease forwards; animation-delay: var(--delay); }
@keyframes skelIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
.skeleton-check { width: var(--ctrl-size); height: var(--ctrl-size); flex-shrink: 0; background: var(--skeleton-bg); animation: shimmer 1.6s ease-in-out infinite; }
.skeleton-content { flex: 1; min-width: 0; }
.skeleton-line { height: 10px; background: var(--skeleton-bg); animation: shimmer 1.6s ease-in-out infinite; animation-delay: 0.1s; }
.skeleton-note { width: 36px; height: 8px; background: var(--skeleton-bg); animation: shimmer 1.6s ease-in-out infinite; animation-delay: 0.2s; flex-shrink: 0; }
@keyframes shimmer { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.8; } }
.real-list { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s ease; }
.real-list:hover { scrollbar-color: var(--scrollbar) transparent; }
.real-list::-webkit-scrollbar { width: 2px; }
.real-list::-webkit-scrollbar-track { background: transparent; }
.real-list::-webkit-scrollbar-thumb { background: transparent; }
.real-list:hover::-webkit-scrollbar-thumb { background: var(--scrollbar); }

.todo-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--border-faint); flex-shrink: 0; transition: border-color 0.4s ease, background 0.3s ease, padding 0.3s ease; }
.todo-item.is-delete-mode { cursor: pointer; }
.todo-item.is-selected { background: rgba(255, 68, 68, 0.06); padding-left: 0.5rem; padding-right: 0.5rem; }
.todo-ctrl { flex-shrink: 0; width: var(--ctrl-size); height: var(--ctrl-size); display: flex; align-items: center; justify-content: center; align-self: flex-start; margin-top: 3px; }
.todo-checkbox { width: var(--ctrl-size); height: var(--ctrl-size); border: 1px solid var(--danger); display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; cursor: pointer; flex-shrink: 0; }
.todo-checkbox.checked { background: var(--danger); }
.checkbox-mark { font-size: 0.7rem; color: #fff; font-weight: 700; line-height: 1; }
.check-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; width: var(--ctrl-size); height: var(--ctrl-size); flex-shrink: 0; }
.check-ring { width: var(--ctrl-size); height: var(--ctrl-size); border: 1px solid var(--check-border); display: flex; align-items: center; justify-content: center; transition: background 0.2s ease, border-color 0.2s ease; flex-shrink: 0; }
.check-ring.checked { background: var(--text); border-color: var(--text); }
.check-mark { font-size: 0.7rem; color: var(--bg); font-weight: 700; line-height: 1; }
.todo-main { flex: 1; min-width: 0; cursor: pointer; display: flex; flex-direction: column; gap: 0.2rem; }
.todo-title-row { display: flex; align-items: center; min-width: 0; gap: 0.6rem; }
.todo-text { font-family: 'Space Mono', monospace; font-size: clamp(0.75rem, 2vw, 0.88rem); letter-spacing: 0.06em; color: var(--text-muted); transition: color 0.2s; word-break: break-word; min-width: 0; flex: 1; }
.todo-main:hover .todo-text { color: var(--text); }
.strikethrough { text-decoration: line-through; color: var(--text-faint); }
.todo-desc-hint { font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.08em; user-select: none; white-space: nowrap; flex-shrink: 0; margin-left: auto; transition: color 0.2s ease; }
.todo-main:hover .todo-desc-hint { color: var(--text); }
.todo-desc-preview { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.4s ease; }

.empty { position: absolute; inset: 0; bottom: 30%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; pointer-events: none; }
.empty-icon { display: block; font-size: 2rem; color: var(--empty-icon); margin-bottom: 1rem; transition: color 0.4s ease; }
.empty p { font-family: 'Space Mono', monospace; font-size: 0.8rem; color: var(--text-faint); letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.4s ease; }

.clear-row { margin-top: 1.5rem; margin-bottom: 1.5rem; text-align: right; flex-shrink: 0; }
.clear-btn { background: none; border: none; font-family: 'Space Mono', monospace; font-size: 0.7rem; color: var(--text-faint); cursor: pointer; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: underline; transition: color 0.2s; }
.clear-btn:hover { color: var(--text-dim); }
.mobile-clear { display: none; }
.desktop-clear { display: block; }

.footer { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-sub); flex-wrap: wrap; flex-shrink: 0; transition: border-color 0.4s ease; }
.footer-copy { font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--text-footer); letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.4s ease; }
.footer-divider { color: var(--border-sub); font-size: 0.7rem; transition: color 0.4s ease; }
.footer-credit { font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--text-footer); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 0.35rem; transition: color 0.4s ease; }
.credit-icon { font-size: 0.55rem; }

.skeleton-fade-enter-active { transition: opacity 0.3s ease; }
.skeleton-fade-leave-active { transition: opacity 0.2s ease; }
.skeleton-fade-enter-from, .skeleton-fade-leave-to { opacity: 0; }
.bar-swap-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.bar-swap-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.bar-swap-enter-from { opacity: 0; transform: translateX(16px); }
.bar-swap-leave-to { opacity: 0; transform: translateX(-16px); }
.trash-btn-enter-active { transition: opacity 0.2s ease 0.15s, transform 0.2s ease 0.15s; }
.trash-btn-leave-active { transition: opacity 0.15s ease; }
.trash-btn-enter-from { opacity: 0; transform: scale(0.7) rotate(-10deg); }
.trash-btn-leave-to { opacity: 0; transform: scale(0.7) rotate(10deg); }
.ctrl-swap-enter-active { transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ctrl-swap-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.ctrl-swap-enter-from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
.ctrl-swap-leave-to { opacity: 0; transform: scale(0.5) rotate(15deg); }
.check-pop-enter-active { transition: opacity 0.15s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.check-pop-leave-active { transition: opacity 0.1s ease; }
.check-pop-enter-from { opacity: 0; transform: scale(0); }
.check-pop-leave-to { opacity: 0; }
.task-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; transition-delay: calc(var(--i, 0) * 0.07s); }
.task-leave-active { transition: opacity 0.25s ease; transition-delay: calc(var(--i, 0) * 0.04s); }
.task-enter-from { opacity: 0; transform: translateX(-14px); }
.task-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.empty-anim-enter-active { transition: opacity 0.4s ease 0.35s, transform 0.4s ease 0.35s; }
.empty-anim-leave-active { transition: opacity 0.15s ease; }
.empty-anim-enter-from { opacity: 0; transform: translateY(10px); }
.empty-anim-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .mobile-only { display: flex; }
  .desktop-only { display: none !important; }
  .app-shell { padding: 1.25rem; align-items: flex-start; padding-top: 2rem; height: 100dvh; min-height: 100dvh; }
  .container { height: calc(100dvh - 3.25rem); max-height: none; }
  .header { margin-bottom: 1rem; gap: 0.5rem; }
  .header-left { gap: 0.75rem; }
  .title { font-size: 1.4rem; letter-spacing: 0.1em; }
  .subtitle { white-space: normal; font-size: 0.6rem; }
  .stat-num { font-size: 1.2rem; }
  .stat-label { font-size: 0.55rem; }
  .stat-divider { font-size: 1rem; margin-bottom: 0.3rem; }
  .header-icon-btn { width: 28px; height: 28px; }
  .todo-list { height: auto; min-height: 200px; max-height: none; flex: 1; }
  .skeleton-list, .real-list { position: relative; inset: unset; height: 100%; }
  .empty { position: absolute; inset: 0; bottom: 30%; justify-content: center; padding-top: 0; }
  .desktop-clear { display: none; }
  .mobile-clear { display: block; }
  .footer { margin-top: auto; padding-top: 1rem; padding-bottom: env(safe-area-inset-bottom, 0.5rem); }
  .delete-actions-inner { flex-wrap: wrap; gap: 0.5rem; }
}
</style>