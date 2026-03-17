<template>
  <Transition name="patch-overlay">
    <div v-if="show" class="patch-backdrop" @click="close">
      <Transition name="patch-modal">
        <div v-if="show" class="patch-modal" @click.stop>

          <div class="patch-header">
            <div class="patch-header-left">
              <span class="patch-eyebrow">Changelog</span>
              <div class="patch-title-row">
                <span class="patch-version">v3.2.5</span>
                <span class="patch-tag">Latest</span>
              </div>
            </div>
            <button class="patch-close" @click="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="patch-date">Released · {{ releaseDate }}</div>

          <div class="patch-divider"></div>

          <div class="patch-body">
            <div
              v-for="(section, si) in notes"
              :key="si"
              class="patch-section"
              :style="{ '--si': si }"
            >
              <div class="patch-section-header">
                <span class="patch-section-icon">{{ section.icon }}</span>
                <span class="patch-section-title">{{ section.title }}</span>
              </div>
              <ul class="patch-list">
                <li
                  v-for="(item, ii) in section.items"
                  :key="ii"
                  class="patch-item"
                  :style="{ '--ii': ii }"
                >
                  <span class="patch-bullet">◆</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="patch-divider"></div>

          <div class="patch-footer">
            <span class="patch-footer-note">TASKS LIST ✦ LANCE TINOCO</span>
            <button class="patch-dismiss" @click="close">Got it</button>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

function close() { emit('close') }

const releaseDate = computed(() => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))

const notes = [
  {
    icon: '◈',
    title: 'User Authentication',
    items: [
      'Sign up & sign in with email and password',
      'OTP verification sent to your email on registration',
      'Secure session management across devices',
    ]
  },
  {
    icon: '◉',
    title: 'Cloud Sync',
    items: [
      'Tasks are now saved to your account in the cloud',
      'Access your tasks from any device, anytime',
      'Real-time sync — no more losing your list',
    ]
  },
  {
    icon: '◍',
    title: 'Profile Management',
    items: [
      'Set a custom display name shown across the app',
      'Change your password anytime from the sidebar',
      'Delete your account and all data permanently',
    ]
  },
  {
    icon: '◐',
    title: 'New UI & Polish',
    items: [
      'Mobile sidebar with swipe-safe touch handling',
      'Light & dark mode toggle from the sidebar',
      'Task notes — add a description to any task',
    ]
  },
]
</script>

<style scoped>
.patch-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.patch-modal {
  background: var(--modal-bg);
  border: 1px solid var(--modal-border);
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─── Header ─────────────────────────────────────────────── */
.patch-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0.75rem;
  flex-shrink: 0;
}
.patch-header-left { display: flex; flex-direction: column; gap: 0.35rem; }
.patch-eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 0.58rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--text-dim);
}
.patch-title-row { display: flex; align-items: center; gap: 0.6rem; }
.patch-version {
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem; font-weight: 700;
  color: var(--text); letter-spacing: 0.06em; line-height: 1;
}
.patch-tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.55rem; letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--modal-bg); background: var(--text);
  padding: 0.2rem 0.5rem; line-height: 1.6;
}
.patch-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem; color: var(--text-dim);
  padding: 0 1.5rem 1rem; flex-shrink: 0;
}
.patch-close {
  background: none; border: none;
  color: var(--text-dim); cursor: pointer;
  padding: 0.25rem; display: flex; align-items: center;
  transition: color 0.2s; flex-shrink: 0;
}
.patch-close:hover { color: var(--text); }

/* ─── Divider ─────────────────────────────────────────────── */
.patch-divider { height: 1px; background: var(--border-faint); flex-shrink: 0; }

/* ─── Body ───────────────────────────────────────────────── */
.patch-body {
  overflow-y: auto; padding: 0.5rem 0; flex: 1;
  scrollbar-width: thin; scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s;
}
.patch-body:hover { scrollbar-color: var(--border) transparent; }

.patch-section {
  padding: 1rem 1.5rem 0.5rem;
  opacity: 0;
  animation: sectionIn 0.4s ease forwards;
  animation-delay: calc(0.05s + var(--si) * 0.08s);
}
@keyframes sectionIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.patch-section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; }
.patch-section-icon { font-size: 0.75rem; color: var(--text); }
.patch-section-title {
  font-family: 'Space Mono', monospace;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--text);
}
.patch-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.patch-item {
  display: flex; align-items: baseline; gap: 0.6rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;
  opacity: 0;
  animation: itemIn 0.35s ease forwards;
  animation-delay: calc(0.1s + var(--si) * 0.08s + var(--ii) * 0.05s);
}
@keyframes itemIn {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
.patch-bullet { font-size: 0.4rem; color: var(--text-dim); flex-shrink: 0; margin-top: 0.1rem; }

/* ─── Footer ─────────────────────────────────────────────── */
.patch-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; flex-shrink: 0;
}
.patch-footer-note {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem; letter-spacing: 0.1em;
  color: var(--text-dim); text-transform: uppercase;
}
.patch-dismiss {
  background: var(--text); border: 1px solid var(--text);
  color: var(--bg);
  font-family: 'Space Mono', monospace;
  font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.55rem 1.1rem; cursor: pointer; transition: opacity 0.15s;
}
.patch-dismiss:hover { opacity: 0.85; }

/* ─── Transitions ────────────────────────────────────────── */
.patch-overlay-enter-active { transition: opacity 0.3s ease; }
.patch-overlay-leave-active { transition: opacity 0.2s ease; }
.patch-overlay-enter-from, .patch-overlay-leave-to { opacity: 0; }
.patch-modal-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.patch-modal-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.patch-modal-enter-from { opacity: 0; transform: scale(0.95) translateY(10px); }
.patch-modal-leave-to   { opacity: 0; transform: scale(0.97) translateY(4px); }
</style>