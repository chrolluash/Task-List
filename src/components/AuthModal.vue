<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal auth-modal">
        <Transition name="auth-step" mode="out-in">

          <div v-if="step === 'form'" key="form" class="auth-step-content">
            <div class="modal-header">
              <span class="modal-label">{{ mode === 'signin' ? 'Sign In' : 'Create Account' }}</span>
              <button class="modal-close" @click="$emit('close')">×</button>
            </div>
            <p class="auth-subtitle">
              {{ mode === 'signin' ? 'Sign in to save and sync your tasks.' : 'Create an account to save and sync your tasks.' }}
            </p>
            <input v-model="email" class="modal-input" type="email" placeholder="Email address" @keydown.enter="handleAuth" />
            <div class="password-wrap">
              <input v-model="password" class="modal-input" :type="showPass ? 'text' : 'password'" placeholder="Password" @keydown.enter="handleAuth" />
              <button class="eye-btn" @click="showPass = !showPass" type="button">
                <svg v-if="!showPass" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <Transition name="fade">
              <div v-if="mode === 'signup'" class="password-wrap">
                <input v-model="confirmPassword" class="modal-input" :type="showConfirm ? 'text' : 'password'" placeholder="Confirm password" @keydown.enter="handleAuth" />
                <button class="eye-btn" @click="showConfirm = !showConfirm" type="button">
                  <svg v-if="!showConfirm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </Transition>
            <Transition name="fade"><p v-if="error" class="auth-error">{{ error }}</p></Transition>
            <div class="modal-actions">
              <button class="auth-switch" @click="toggleMode">{{ mode === 'signin' ? 'Need an account?' : 'Already have one?' }}</button>
              <button class="modal-save" @click="handleAuth" :disabled="submitting || !email || !password">
                <span v-if="submitting" class="auth-spinner">◌</span>
                <span v-else>{{ mode === 'signin' ? 'Sign In' : 'Sign Up' }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="step === 'otp'" key="otp" class="auth-step-content">
            <div class="modal-header">
              <span class="modal-label">Check Your Email</span>
              <button class="modal-close" @click="$emit('close')">×</button>
            </div>
            <p class="auth-subtitle">We sent a 6-digit code to <strong>{{ email }}</strong>.</p>
            <div class="otp-row">
              <input
                v-for="(_, i) in otpDigits" :key="i"
                :ref="el => otpRefs[i] = el"
                v-model="otpDigits[i]"
                class="otp-input" type="text" inputmode="numeric" maxlength="1"
                @input="onOtpInput(i)" @keydown="onOtpKeydown($event, i)" @paste.prevent="onOtpPaste($event)"
              />
            </div>
            <Transition name="fade"><p v-if="error" class="auth-error">{{ error }}</p></Transition>
            <Transition name="fade"><p v-if="success" class="auth-success">{{ success }}</p></Transition>
            <div class="modal-actions">
              <button class="auth-switch" @click="step = 'form'">← Back</button>
              <button class="modal-save" @click="handleVerifyOtp" :disabled="submitting || otpDigits.join('').length < 6">
                <span v-if="submitting" class="auth-spinner">◌</span>
                <span v-else>Verify</span>
              </button>
            </div>
          </div>

        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'success'])

const { signUp, signIn, verifyOtp } = useAuth()

const mode = ref('signin')
const step = ref('form')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const submitting = ref(false)
const showPass = ref(false)
const showConfirm = ref(false)
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref([])

watch(() => props.show, (val) => {
  if (val) reset()
})

function reset() {
  step.value = 'form'
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  error.value = ''
  success.value = ''
  submitting.value = false
  showPass.value = false
  showConfirm.value = false
  otpDigits.value = ['', '', '', '', '', '']
}

function toggleMode() {
  mode.value = mode.value === 'signin' ? 'signup' : 'signin'
  error.value = ''
  confirmPassword.value = ''
  showPass.value = false
  showConfirm.value = false
}

async function handleAuth() {
  error.value = ''
  if (!email.value || !password.value) return
  if (mode.value === 'signup') {
    if (!confirmPassword.value) { error.value = 'Please confirm your password.'; return }
    if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return }
    if (password.value.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  }
  submitting.value = true
  if (mode.value === 'signin') {
    const err = await signIn(email.value, password.value)
    submitting.value = false
    if (err) { error.value = err.message; return }
    emit('success')
  } else {
    const err = await signUp(email.value, password.value)
    submitting.value = false
    if (err) { error.value = err.message; return }
    step.value = 'otp'
    otpDigits.value = ['', '', '', '', '', '']
    setTimeout(() => otpRefs.value[0]?.focus(), 100)
  }
}

function onOtpInput(i) {
  if (otpDigits.value[i] && i < 5) setTimeout(() => otpRefs.value[i + 1]?.focus(), 0)
  if (otpDigits.value.join('').length === 6) handleVerifyOtp()
}
function onOtpKeydown(e, i) {
  if (e.key === 'Backspace' && !otpDigits.value[i] && i > 0) setTimeout(() => otpRefs.value[i - 1]?.focus(), 0)
}
function onOtpPaste(e) {
  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  if (pasted.length === 6) { otpDigits.value = pasted.split(''); setTimeout(() => otpRefs.value[5]?.focus(), 0) }
}

async function handleVerifyOtp() {
  const token = otpDigits.value.join('')
  if (token.length < 6) return
  submitting.value = true
  error.value = ''
  const err = await verifyOtp(email.value, token)
  submitting.value = false
  if (err) { error.value = err.message; otpDigits.value = ['', '', '', '', '', '']; setTimeout(() => otpRefs.value[0]?.focus(), 0); return }
  emit('success')
}
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1.5rem; backdrop-filter: blur(4px); }
.modal { background: var(--modal-bg); border: 1px solid var(--modal-border); width: 100%; max-width: 420px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
.modal-label { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; color: var(--text-dim); text-transform: uppercase; }
.modal-close { background: none; border: none; color: var(--text-faint); font-size: 1.4rem; cursor: pointer; line-height: 1; transition: color 0.15s; padding: 0; }
.modal-close:hover { color: var(--text); }
.auth-step-content { display: flex; flex-direction: column; gap: 1.25rem; }
.auth-subtitle { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-dim); line-height: 1.5; }
.auth-subtitle strong { color: var(--text-muted); }
.modal-input {
  background: transparent; border: none; border-bottom: 1px solid var(--modal-border);
  color: var(--text); font-family: 'Space Mono', monospace; font-size: 0.82rem;
  font-weight: 400; letter-spacing: 0.04em; outline: none;
  padding: 0 2rem 0.6rem 0; width: 100%; transition: border-color 0.2s, color 0.4s ease;
}
.modal-input:focus { border-bottom-color: var(--text); }
.modal-input::placeholder { color: var(--text-faint); }
.password-wrap { position: relative; display: flex; align-items: flex-end; }
.password-wrap .modal-input { width: 100%; }
.eye-btn { position: absolute; right: 0; bottom: 0.55rem; background: none; border: none; color: var(--text-faint); cursor: pointer; padding: 0; display: flex; align-items: center; transition: color 0.2s ease; }
.eye-btn:hover { color: var(--text); }
.auth-error { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--danger); }
.auth-success { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #4ade80; }
.auth-switch { background: none; border: none; color: var(--text-dim); font-family: 'Space Mono', monospace; font-size: 0.62rem; letter-spacing: 0.06em; cursor: pointer; text-decoration: underline; padding: 0; transition: color 0.2s; }
.auth-switch:hover { color: var(--text); }
.auth-spinner { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; }
.modal-save { background: var(--text); border: 1px solid var(--text); color: var(--bg); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.4rem; cursor: pointer; min-width: 90px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modal-save:hover:not(:disabled) { opacity: 0.85; }
.modal-save:disabled { opacity: 0.2; cursor: not-allowed; }
.otp-row { display: flex; gap: 0.6rem; justify-content: center; }
.otp-input { width: 46px; height: 56px; background: transparent; border: 1px solid var(--modal-border); color: var(--text); font-family: 'Space Mono', monospace; font-size: 1.4rem; font-weight: 700; text-align: center; outline: none; transition: border-color 0.2s; caret-color: transparent; }
.otp-input:focus { border-color: var(--text); }
.auth-step-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.auth-step-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.auth-step-enter-from { opacity: 0; transform: translateX(20px); }
.auth-step-leave-to   { opacity: 0; transform: translateX(-20px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: scale(0.97) translateY(8px); }
.modal-leave-to   { opacity: 0; transform: scale(0.97) translateY(8px); }
@media (max-width: 480px) {
  .modal { max-width: 100%; padding: 1.5rem; gap: 1rem; }
  .otp-input { width: 38px; height: 48px; font-size: 1.2rem; }
}
</style>