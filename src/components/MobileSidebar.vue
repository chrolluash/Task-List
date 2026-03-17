<template>
  <!-- Backdrop — tap outside to close -->
  <Transition name="sidebar-backdrop">
    <div v-if="open" class="sidebar-backdrop" @click="$emit('close')" @touchend.stop="$emit('close')"></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="sidebar">
    <div
      v-if="open"
      class="sidebar"
      @click.stop
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >

      <div class="sidebar-header">
        <div class="sidebar-logo-wrap">
          <svg class="sidebar-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20">
            <rect x='6' y='8' width='14' height='2' rx='1' fill='currentColor'/>
            <rect x='6' y='13' width='14' height='2' rx='1' fill='currentColor'/>
            <rect x='6' y='18' width='10' height='2' rx='1' fill='currentColor'/>
            <rect x='22' y='20' width='2' height='6' rx='1' fill='currentColor'/>
            <rect x='19' y='23' width='8' height='2' rx='1' fill='currentColor'/>
          </svg>
          <span class="sidebar-logo">PROFILE</span>
        </div>
        <button class="sidebar-hamburger" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="sidebar-user">
        <div class="sidebar-avatar">{{ displayInitial }}</div>
        <div class="sidebar-user-info">
          <p class="sidebar-username">{{ displayName }}</p>
          <p class="sidebar-email">{{ user?.email }}</p>
        </div>
      </div>

      <div class="sidebar-stats">
        <div class="sidebar-stat">
          <span class="sidebar-stat-num">{{ remaining }}</span>
          <span class="sidebar-stat-label">Remaining</span>
        </div>
        <div class="sidebar-stat-divider"></div>
        <div class="sidebar-stat">
          <span class="sidebar-stat-num">{{ total }}</span>
          <span class="sidebar-stat-label">Total</span>
        </div>
        <div class="sidebar-stat-divider"></div>
        <div class="sidebar-stat">
          <span class="sidebar-stat-num">{{ done }}</span>
          <span class="sidebar-stat-label">Done</span>
        </div>
      </div>

      <div class="sidebar-divider"></div>

      <button class="sidebar-row" @click.stop="$emit('toggle-theme')">
        <span class="sidebar-row-icon">{{ isLight ? '◑' : '◐' }}</span>
        <span class="sidebar-row-label">{{ isLight ? 'Light Mode' : 'Dark Mode' }}</span>
        <span class="sidebar-row-arrow">→</span>
      </button>

      <div class="sidebar-divider"></div>

      <div class="sidebar-field">
        <label class="sidebar-field-label">Display Name</label>
        <div class="input-with-clear">
          <input
            v-model="username"
            class="sidebar-input"
            placeholder="Enter a display name..."
            maxlength="30"
            @click.stop
          />
          <button v-if="username" class="clear-input-btn" @click.stop="username = ''" type="button">×</button>
        </div>
      </div>

      <Transition name="fade"><p v-if="usernameSuccess" class="sidebar-success">{{ usernameSuccess }}</p></Transition>
      <Transition name="fade"><p v-if="usernameError" class="sidebar-error">{{ usernameError }}</p></Transition>

      <button class="sidebar-btn" @click.stop="handleUpdateUsername" :disabled="usernameSubmitting || !username.trim()">
        <span v-if="usernameSubmitting" class="auth-spinner">◌</span>
        <span v-else>Save Name</span>
      </button>

      <div class="sidebar-divider sidebar-section-gap"></div>

      <div class="sidebar-section-label">Change Password</div>

      <div class="sidebar-field">
        <div class="password-wrap">
          <input
            v-model="newPassword"
            class="sidebar-input"
            :type="showNew ? 'text' : 'password'"
            placeholder="New password..."
            @click.stop
          />
          <button class="eye-btn" @click.stop="showNew = !showNew" type="button">
            <svg v-if="!showNew" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <div class="sidebar-field">
        <div class="password-wrap">
          <input
            v-model="confirmPassword"
            class="sidebar-input"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Confirm new password..."
            @click.stop
          />
          <button class="eye-btn" @click.stop="showConfirm = !showConfirm" type="button">
            <svg v-if="!showConfirm" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <Transition name="fade"><p v-if="passwordError" class="sidebar-error">{{ passwordError }}</p></Transition>
      <Transition name="fade"><p v-if="passwordSuccess" class="sidebar-success">{{ passwordSuccess }}</p></Transition>

      <button class="sidebar-btn" @click.stop="handleUpdatePassword" :disabled="passwordSubmitting || !newPassword || !confirmPassword">
        <span v-if="passwordSubmitting" class="auth-spinner">◌</span>
        <span v-else>Update Password</span>
      </button>

      <div class="sidebar-divider sidebar-section-gap"></div>

      <div class="sidebar-section-label danger-label">Danger Zone</div>

      <button class="sidebar-btn danger-btn" @click.stop="handleDelete" :disabled="deleteSubmitting">
        <span v-if="deleteSubmitting" class="auth-spinner">◌</span>
        <span v-else>Delete Account</span>
      </button>

      <div class="sidebar-footer">
        <button class="sidebar-signout" @click.stop="handleSignOut">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  open: Boolean,
  user: Object,
  profile: Object,
  isLight: Boolean,
  remaining: Number,
  total: Number,
  done: Number
})
const emit = defineEmits(['close', 'toggle-theme'])

const { updateUsername, updatePassword, deleteAccount, signOut } = useAuth()

const displayName = computed(() => props.profile?.username || props.user?.email?.split('@')[0] || 'User')
const displayInitial = computed(() => displayName.value.charAt(0).toUpperCase())

const username = ref('')
const usernameSuccess = ref('')
const usernameError = ref('')
const usernameSubmitting = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordSubmitting = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const deleteSubmitting = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    username.value = props.profile?.username ?? ''
    usernameSuccess.value = ''
    usernameError.value = ''
    passwordError.value = ''
    passwordSuccess.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
})

watch(() => props.profile?.username, (val) => {
  if (val !== undefined) username.value = val ?? ''
})

async function handleUpdateUsername() {
  if (!username.value.trim()) return
  usernameSubmitting.value = true
  usernameError.value = ''
  usernameSuccess.value = ''
  const error = await updateUsername(username.value.trim())
  usernameSubmitting.value = false
  if (error) { usernameError.value = error.message; return }
  usernameSuccess.value = 'Display name updated!'
}

async function handleUpdatePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (newPassword.value !== confirmPassword.value) { passwordError.value = 'Passwords do not match.'; return }
  if (newPassword.value.length < 6) { passwordError.value = 'Password must be at least 6 characters.'; return }
  passwordSubmitting.value = true
  const error = await updatePassword(newPassword.value)
  passwordSubmitting.value = false
  if (error) { passwordError.value = error.message; return }
  passwordSuccess.value = 'Password updated!'
  newPassword.value = ''
  confirmPassword.value = ''
}

async function handleDelete() {
  if (!confirm('Are you sure? This will permanently delete your account and all tasks.')) return
  deleteSubmitting.value = true
  await deleteAccount()
  deleteSubmitting.value = false
  emit('close')
}

async function handleSignOut() {
  emit('close')
  await signOut()
}
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  backdrop-filter: blur(2px);
}
.sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 85vw;
  max-width: 320px;
  background: var(--modal-bg);
  border-right: 1px solid var(--modal-border);
  z-index: 201;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

/* ─── Header ─────────────────────────────────────────────── */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-faint);
  flex-shrink: 0;
}
.sidebar-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sidebar-logo-icon {
  color: var(--text);
  flex-shrink: 0;
  transition: color 0.4s ease;
}
.sidebar-logo {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem; font-weight: 700;
  color: var(--text); letter-spacing: 0.15em;
  transition: color 0.4s ease;
}
.sidebar-hamburger {
  background: none; border: none;
  color: var(--text-dim); cursor: pointer;
  padding: 0.25rem; display: flex;
  align-items: center; transition: color 0.2s;
}
.sidebar-hamburger:hover { color: var(--text); }

/* ─── User ───────────────────────────────────────────────── */
.sidebar-user {
  display: flex; align-items: center;
  gap: 0.85rem; padding: 1.25rem 1.5rem;
}
.sidebar-avatar {
  width: 40px; height: 40px;
  background: var(--border);
  border: 1px solid var(--border-sub);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 1rem; font-weight: 700;
  color: var(--text); flex-shrink: 0;
}
.sidebar-user-info { min-width: 0; }
.sidebar-username {
  font-family: 'Space Mono', monospace;
  font-size: 0.78rem; font-weight: 700;
  color: var(--text); letter-spacing: 0.04em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sidebar-email {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem; color: var(--text-dim); margin-top: 0.1rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ─── Stats ──────────────────────────────────────────────── */
.sidebar-stats {
  display: flex; align-items: center;
  padding: 0.75rem 1.5rem 1.25rem;
}
.sidebar-stat {
  flex: 1; text-align: center;
  display: flex; flex-direction: column; gap: 0.2rem;
}
.sidebar-stat-num {
  font-family: 'Space Mono', monospace;
  font-size: 1.4rem; font-weight: 700;
  color: var(--text); line-height: 1;
}
.sidebar-stat-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.sidebar-stat-divider {
  width: 1px; height: 32px;
  background: var(--border-sub); flex-shrink: 0;
}

/* ─── Dividers ───────────────────────────────────────────── */
.sidebar-divider { height: 1px; background: var(--border-faint); margin: 0.25rem 0; flex-shrink: 0; }
.sidebar-section-gap { margin-top: 1.25rem; }

/* ─── Rows ───────────────────────────────────────────────── */
.sidebar-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  background: none; border: none;
  cursor: pointer; width: 100%;
  transition: background 0.15s;
}
.sidebar-row:hover { background: rgba(255,255,255,0.03); }
.sidebar-row-icon { font-size: 0.9rem; color: var(--text); width: 20px; text-align: center; }
.sidebar-row-label { font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.06em; flex: 1; text-align: left; }
.sidebar-row-arrow { font-size: 0.7rem; color: var(--text-faint); }

/* ─── Section labels ─────────────────────────────────────── */
.sidebar-section-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.58rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--text-dim);
  padding: 1.25rem 1.5rem 0.5rem;
}
.danger-label { color: var(--danger); }

/* ─── Fields ─────────────────────────────────────────────── */
.sidebar-field { padding: 0.5rem 1.5rem; }
.sidebar-field-label {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 0.58rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-dim);
  margin-bottom: 0.5rem;
}
.sidebar-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem; font-weight: 400;
  letter-spacing: 0.02em;
  outline: none;
  padding: 0.3rem 2rem 0.5rem 0;
  width: 100%;
  transition: border-color 0.2s;
}
.sidebar-input:focus { border-bottom-color: var(--text); }
.sidebar-input::placeholder { color: var(--text-faint); }

.input-with-clear { position: relative; display: flex; align-items: flex-end; }
.input-with-clear .sidebar-input { width: 100%; }
.clear-input-btn {
  position: absolute; right: 0; bottom: 0.45rem;
  background: none; border: none;
  color: var(--text-faint); font-size: 1rem;
  cursor: pointer; padding: 0; line-height: 1;
  transition: color 0.2s ease;
}
.clear-input-btn:hover { color: var(--text); }

.password-wrap { position: relative; display: flex; align-items: flex-end; }
.password-wrap .sidebar-input { width: 100%; }
.eye-btn {
  position: absolute; right: 0; bottom: 0.45rem;
  background: none; border: none;
  color: var(--text-faint); cursor: pointer;
  padding: 0; display: flex; align-items: center;
  transition: color 0.2s;
}
.eye-btn:hover { color: var(--text); }

/* ─── Buttons ────────────────────────────────────────────── */
.sidebar-btn {
  margin: 0.5rem 1.5rem 0;
  background: var(--text);
  border: 1px solid var(--text);
  color: var(--bg);
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem; letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.6rem 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.sidebar-btn:hover:not(:disabled) { opacity: 0.85; }
.sidebar-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.danger-btn { background: none; border-color: var(--danger); color: var(--danger); }
.danger-btn:hover:not(:disabled) { background: var(--danger); color: #fff; opacity: 1; }

.sidebar-success { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #4ade80; padding: 0.25rem 1.5rem 0; }
.sidebar-error { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: var(--danger); padding: 0.25rem 1.5rem 0; }
.auth-spinner { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Footer ─────────────────────────────────────────────── */
.sidebar-footer { margin-top: auto; padding: 1.5rem; border-top: 1px solid var(--border-faint); }
.sidebar-signout {
  background: none; border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem; letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.6rem 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; width: 100%; transition: all 0.15s;
}
.sidebar-signout:hover { border-color: var(--text-dim); color: var(--text); }

/* ─── Transitions ────────────────────────────────────────── */
.sidebar-backdrop-enter-active { transition: opacity 0.25s ease; }
.sidebar-backdrop-leave-active { transition: opacity 0.2s ease; }
.sidebar-backdrop-enter-from, .sidebar-backdrop-leave-to { opacity: 0; }
.sidebar-enter-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-enter-from, .sidebar-leave-to { transform: translateX(-100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>