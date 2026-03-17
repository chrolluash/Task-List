<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal profile-modal">

        <div class="modal-header">
          <span class="modal-label">Profile</span>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>

        <!-- Account info -->
        <div class="profile-info">
          <div class="profile-info-row">
            <span class="profile-info-label">Email</span>
            <span class="profile-info-value">{{ user?.email }}</span>
          </div>
        </div>

        <!-- Username -->
        <div class="profile-section">
          <label class="profile-section-label">Display Name</label>
          <div class="input-with-clear">
            <input
              v-model="username"
              class="modal-input"
              placeholder="Enter a display name..."
              maxlength="30"
            />
            <button v-if="username" class="clear-input-btn" @click="username = ''" type="button" title="Clear">×</button>
          </div>
        </div>

        <Transition name="fade"><p v-if="usernameSuccess" class="auth-success">{{ usernameSuccess }}</p></Transition>
        <Transition name="fade"><p v-if="usernameError" class="auth-error">{{ usernameError }}</p></Transition>

        <div class="modal-actions">
          <button class="modal-save" @click="handleUpdateUsername" :disabled="usernameSubmitting || !username.trim()">
            <span v-if="usernameSubmitting" class="auth-spinner">◌</span>
            <span v-else>Save Name</span>
          </button>
        </div>

        <div class="profile-divider"></div>

        <!-- Change Password -->
        <div class="profile-section">
          <label class="profile-section-label">Change Password</label>
          <div class="password-wrap">
            <input v-model="newPassword" class="modal-input" :type="showNew ? 'text' : 'password'" placeholder="New password..." />
            <button class="eye-btn" @click="showNew = !showNew" type="button">
              <svg v-if="!showNew" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <div class="password-wrap">
            <input v-model="confirmPassword" class="modal-input" :type="showConfirm ? 'text' : 'password'" placeholder="Confirm new password..." />
            <button class="eye-btn" @click="showConfirm = !showConfirm" type="button">
              <svg v-if="!showConfirm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <Transition name="fade"><p v-if="passwordError" class="auth-error">{{ passwordError }}</p></Transition>
        <Transition name="fade"><p v-if="passwordSuccess" class="auth-success">{{ passwordSuccess }}</p></Transition>

        <div class="modal-actions">
          <button class="modal-save" @click="handleUpdatePassword" :disabled="passwordSubmitting || !newPassword || !confirmPassword">
            <span v-if="passwordSubmitting" class="auth-spinner">◌</span>
            <span v-else>Update Password</span>
          </button>
        </div>

        <div class="profile-divider"></div>

        <!-- Danger zone -->
        <div class="profile-danger-zone">
          <div>
            <p class="profile-danger-title">Delete Account</p>
            <p class="profile-danger-sub">Permanently deletes your account and all tasks.</p>
          </div>
          <button class="profile-delete-btn" @click="handleDelete" :disabled="deleteSubmitting">
            <span v-if="deleteSubmitting" class="auth-spinner">◌</span>
            <span v-else>Delete</span>
          </button>
        </div>

        <button class="profile-signout-btn" @click="handleSignOut">
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
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({ show: Boolean, user: Object, profile: Object })
const emit = defineEmits(['close'])

const { updateUsername, updatePassword, deleteAccount, signOut } = useAuth()

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

watch(() => props.show, (val) => {
  if (val) {
    // Pre-fill with saved username
    username.value = props.profile?.username ?? ''
    usernameSuccess.value = ''
    usernameError.value = ''
    passwordError.value = ''
    passwordSuccess.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showNew.value = false
    showConfirm.value = false
  }
})

// Keep username input in sync if profile updates while modal is open
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
  if (!confirm('Are you sure? This will permanently delete your account and all your tasks.')) return
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
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1.5rem; backdrop-filter: blur(4px); }
.modal { background: var(--modal-bg); border: 1px solid var(--modal-border); width: 100%; max-width: 420px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
.modal-label { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; color: var(--text-dim); text-transform: uppercase; }
.modal-close { background: none; border: none; color: var(--text-faint); font-size: 1.4rem; cursor: pointer; line-height: 1; transition: color 0.15s; padding: 0; }
.modal-close:hover { color: var(--text); }

/* ─── Profile info ───────────────────────────────────────── */
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
}
.profile-info-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.profile-info-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
}
.profile-info-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--text-muted);
}
.profile-info-value.highlight {
  color: var(--text);
  font-weight: 500;
}

/* ─── Input — underline style, normal font ───────────────── */
.modal-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--modal-border);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  outline: none;
  padding: 0 2rem 0.6rem 0;
  width: 100%;
  transition: border-color 0.2s, color 0.4s ease;
}
.modal-input:focus { border-bottom-color: var(--text); }
.modal-input::placeholder { color: var(--text-faint); }

/* ─── Input with clear button ────────────────────────────── */
.input-with-clear {
  position: relative;
  display: flex;
  align-items: flex-end;
}
.input-with-clear .modal-input { width: 100%; }
.clear-input-btn {
  position: absolute;
  right: 0;
  bottom: 0.5rem;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clear-input-btn:hover { color: var(--text); }

/* ─── Password wrap ──────────────────────────────────────── */
.password-wrap { position: relative; display: flex; align-items: flex-end; }
.password-wrap .modal-input { width: 100%; }
.eye-btn { position: absolute; right: 0; bottom: 0.5rem; background: none; border: none; color: var(--text-faint); cursor: pointer; padding: 0; display: flex; align-items: center; transition: color 0.2s ease; }
.eye-btn:hover { color: var(--text); }

.profile-section { display: flex; flex-direction: column; gap: 0.75rem; }
.profile-section-label { font-family: 'Space Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }
.profile-divider { height: 1px; background: var(--modal-border); }
.profile-danger-zone { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; }
.profile-danger-title { font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--danger); letter-spacing: 0.06em; margin-bottom: 0.2rem; }
.profile-danger-sub { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: var(--text-dim); line-height: 1.4; }
.profile-delete-btn { background: none; border: 1px solid var(--danger); color: var(--danger); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.4rem 0.9rem; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
.profile-delete-btn:hover:not(:disabled) { background: var(--danger); color: #fff; }
.profile-delete-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.profile-signout-btn { background: none; border: 1px solid var(--modal-border); color: var(--text-dim); font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.6rem 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.15s; width: 100%; }
.profile-signout-btn:hover { border-color: var(--text-dim); color: var(--text); }

.auth-error { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--danger); }
.auth-success { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #4ade80; }
.auth-spinner { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-actions { display: flex; justify-content: flex-end; }
.modal-save { background: var(--text); border: 1px solid var(--text); color: var(--bg); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.4rem; cursor: pointer; min-width: 90px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-save:hover:not(:disabled) { opacity: 0.85; }
.modal-save:disabled { opacity: 0.2; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: scale(0.97) translateY(8px); }
.modal-leave-to   { opacity: 0; transform: scale(0.97) translateY(8px); }

@media (max-width: 480px) {
  .modal { max-width: 100%; padding: 1.5rem; gap: 1rem; }
  .profile-danger-zone { flex-direction: column; align-items: flex-start; }
}
</style>