<script setup>
import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()

const text = ref('')
const category = ref(store.categories[0])
const priority = ref('Medium')
const repeat = ref('None')
const estimatedPomodoros = ref(1)
const dueDate = ref('')
const dueTime = ref('')

const handleSubmit = () => {
  if (!text.value.trim()) return
  
  store.addTodo({
    text: text.value,
    category: category.value,
    priority: priority.value,
    repeat: repeat.value,
    estimatedPomodoros: estimatedPomodoros.value,
    dueDate: dueDate.value || null,
    dueTime: dueTime.value || null
  })
  
  text.value = ''
  dueDate.value = ''
  dueTime.value = ''
  // Keep category/priority for rapid entry or reset? Let's reset priority.
  priority.value = 'Medium'
  repeat.value = 'None'
  estimatedPomodoros.value = 1
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="todo-input-form card">
    <div class="input-group">
      <input 
        v-model="text" 
        type="text" 
        placeholder="Was muss erledigt werden?" 
        class="main-input"
        autofocus
      />
    </div>
    
    <div class="options-group">
      <div class="options-row">
        <select v-model="category" aria-label="Kategorie">
          <option v-for="cat in store.categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        
        <select v-model="priority" aria-label="Priorität">
          <option value="Low">Niedrige Priorität</option>
          <option value="Medium">Mittlere Priorität</option>
          <option value="High">Hohe Priorität</option>
        </select>

        <select v-model="repeat" aria-label="Wiederholung">
            <option value="None">Keine Wiederholung</option>
            <option value="Daily">Täglich</option>
            <option value="Weekly">Wöchentlich</option>
            <option value="Monthly">Monatlich</option>
        </select>
        
        <div class="pomodoro-estimate">
            <span class="estimate-label">🍅 Schätzung:</span>
            <input 
                v-model.number="estimatedPomodoros" 
                type="number" 
                min="1" 
                max="50" 
                class="estimate-input"
            />
        </div>
      </div>
      
      <div class="options-row">
        <div class="datetime-group">
          <div class="input-wrapper">
             <!-- Calendar Icon -->
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="input-icon"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <input 
              v-model="dueDate" 
              type="date" 
              aria-label="Fälligkeitsdatum"
              class="date-input"
            />
          </div>
          
          <div class="input-wrapper">
             <!-- Clock Icon -->
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="input-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <input 
              v-model="dueTime" 
              type="time" 
              aria-label="Fälligkeitszeit"
              class="time-input"
            />
          </div>
        </div>
        
        <button type="submit" class="btn-primary">
          Aufgabe hinzufügen
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.todo-input-form {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
  box-shadow: none; /* Minimalist override */
  padding: var(--spacing-lg);
}

.main-input {
  width: 100%;
  border: none;
  font-size: 1.25rem;
  padding: 0;
  background: transparent;
  font-family: var(--font-body);
}

.main-input:focus {
  outline: none;
  box-shadow: none;
}

/* Styled Selects */
.options-group select {
  font-size: 0.875rem;
  padding: 6px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-muted);
}

.options-group select:hover {
  background-color: #ededed;
  color: var(--color-text);
  border-color: #ccc;
}

.options-group select:focus {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.pomodoro-estimate {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: var(--color-text-muted);
}

.estimate-input {
    width: 60px;
    padding: 6px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-align: center;
    font-size: 0.875rem;
}

/* Modern Date/Time Inputs */
.datetime-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-muted);
  pointer-events: none; /* Let clicks pass through to input */
  z-index: 1;
}

.date-input,
.time-input {
  font-family: var(--font-body);
  font-size: 0.875rem;
  padding: 6px 12px 6px 34px; /* Left padding for icon */
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none; /* Remove default styling */
  -webkit-appearance: none;
}

/* Specific widths for inputs */
.date-input {
  min-width: 140px;
}

.time-input {
  min-width: 100px;
}

.date-input:hover,
.time-input:hover {
  background-color: #ededed;
  border-color: #ccc;
  color: var(--color-text);
}

.date-input:focus,
.time-input:focus {
  border-color: var(--color-accent);
  color: var(--color-text);
  outline: none;
}

/* Webkit specific structure for calendar icon inside input */
::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.btn-primary {
  transition: transform 0.1s ease, background-color 0.2s;
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
