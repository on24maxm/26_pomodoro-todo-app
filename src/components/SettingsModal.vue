<script setup>
import { ref, watch } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const store = useTodoStore()

// Local state to avoid direct store mutation until save
const form = ref({ ...store.timerSettings })

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.value = { ...store.timerSettings }
  }
})

const save = () => {
  store.updateTimerSettings(form.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content card">
        <h3>Timer Einstellungen</h3>
        
        <div class="setting-group">
          <label>Fokusdauer (Minuten)</label>
          <input type="number" v-model.number="form.work" min="1" max="60" />
        </div>
        
        <div class="setting-group">
          <label>Kurze Pause (Minuten)</label>
          <input type="number" v-model.number="form.shortBreak" min="1" max="30" />
        </div>
        
        <div class="setting-group">
          <label>Lange Pause (Minuten)</label>
          <input type="number" v-model.number="form.longBreak" min="1" max="60" />
        </div>

        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-text">Abbrechen</button>
          <button @click="save" class="btn-primary">Speichern</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

h3 {
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.setting-group {
  margin-bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-group label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
