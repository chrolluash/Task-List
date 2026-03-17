<template>
  <Transition name="modal">
    <div v-if="todo" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-label">TASK</span>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        <input v-model="localTitle" class="modal-title-input" placeholder="Task title..." maxlength="100" />
        <label class="modal-desc-label">Notes</label>
        <textarea v-model="localDesc" class="modal-textarea" placeholder="Add a description, due date, links — anything useful..." maxlength="500" rows="6"></textarea>
        <span class="modal-char">{{ localDesc.length }}/500</span>
        <div class="modal-actions">
          <button class="modal-cancel" @click="$emit('close')">Cancel</button>
          <button class="modal-save" @click="handleSave" :disabled="!localTitle.trim()">Save</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ todo: Object })
const emit = defineEmits(['close', 'save'])

const localTitle = ref('')
const localDesc = ref('')

watch(() => props.todo, (val) => {
  if (val) { localTitle.value = val.title; localDesc.value = val.description || '' }
})

function handleSave() {
  if (!localTitle.value.trim()) return
  emit('save', { id: props.todo.id, title: localTitle.value.trim(), description: localDesc.value.trim() })
}
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1.5rem; backdrop-filter: blur(4px); }
.modal { background: var(--modal-bg); border: 1px solid var(--modal-border); width: 100%; max-width: 600px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.25rem; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
.modal-label { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; color: var(--text-dim); text-transform: uppercase; }
.modal-close { background: none; border: none; color: var(--text-faint); font-size: 1.4rem; cursor: pointer; line-height: 1; transition: color 0.15s; padding: 0; }
.modal-close:hover { color: var(--text); }
.modal-title-input { background: transparent; border: none; border-bottom: 1px solid var(--modal-border); color: var(--text); font-family: 'Space Mono', monospace; font-size: clamp(0.9rem, 2.5vw, 1.2rem); font-weight: 700; letter-spacing: 0.08em; outline: none; padding: 0 0 0.6rem 0; width: 100%; transition: border-color 0.2s; }
.modal-title-input:focus { border-bottom-color: var(--text); }
.modal-title-input::placeholder { color: var(--text-faint); font-weight: 400; }
.modal-desc-label { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }
.modal-textarea { background: transparent; border: 1px solid var(--modal-border); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.95rem; line-height: 1.7; padding: 1rem 1.2rem; outline: none; resize: none; transition: border-color 0.2s; width: 100%; }
.modal-textarea::placeholder { color: var(--text-faint); font-size: 0.85rem; }
.modal-textarea:focus { border-color: var(--text); }
.modal-char { font-family: 'Space Mono', monospace; font-size: 0.6rem; color: var(--text-faint); letter-spacing: 0.08em; text-align: right; margin-top: -0.6rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
.modal-cancel { background: none; border: 1px solid var(--modal-border); color: var(--text-dim); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.4rem; cursor: pointer; transition: all 0.15s; }
.modal-cancel:hover { border-color: var(--text-dim); color: var(--text); }
.modal-save { background: var(--text); border: 1px solid var(--text); color: var(--bg); font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.7rem 1.4rem; cursor: pointer; transition: all 0.2s; }
.modal-save:hover:not(:disabled) { opacity: 0.85; }
.modal-save:disabled { opacity: 0.2; cursor: not-allowed; }
.modal-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.modal-enter-from { opacity: 0; transform: scale(0.97) translateY(8px); }
.modal-leave-to   { opacity: 0; transform: scale(0.97) translateY(8px); }
@media (max-width: 480px) {
  .modal { max-width: 100%; padding: 1.5rem; gap: 1rem; }
}
</style>