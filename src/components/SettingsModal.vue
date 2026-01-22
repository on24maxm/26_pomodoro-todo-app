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

const newCategory = ref('')

const addNewCategory = () => {
  if (newCategory.value.trim()) {
    store.addCategory(newCategory.value.trim())
    newCategory.value = ''
  }
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

        <div class="setting-group">
          <label>Kategorien verwalten</label>
          <div class="category-list">
            <div v-for="cat in store.categories" :key="cat" class="category-item">
              <span>{{ cat }}</span>
              <button @click="store.deleteCategory(cat)" class="btn-icon" title="Löschen" aria-label="Kategorie löschen">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div class="add-category">
            <input 
              type="text" 
              v-model="newCategory" 
              placeholder="Neue Kategorie..." 
              @keyup.enter="addNewCategory"
            />
            <button @click="addNewCategory" class="btn-small" :disabled="!newCategory.trim()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
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

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 4px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--color-bg-secondary, #f5f5f5);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-icon:hover {
  color: #ef4444; /* Red for delete */
  background-color: rgba(239, 68, 68, 0.1);
}

.add-category {
  display: flex;
  gap: 8px;
}

.add-category input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.btn-small {
  padding: 6px 10px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small:not(:disabled):hover {
  filter: brightness(1.1);
}
</style>
