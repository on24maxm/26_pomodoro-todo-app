<script setup>
import { ref, computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})

const store = useTodoStore()
const isExpanded = ref(false)
const newSubtaskText = ref('')

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const priorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'var(--color-priority-high)'
    case 'Medium': return 'var(--color-priority-medium)'
    case 'Low': return 'var(--color-priority-low)'
    default: return 'var(--color-text-muted)'
  }
}

const formatDateTime = (dueDate, dueTime) => {
  if (!dueDate) return null
  
  const date = new Date(dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  const isPast = date < today && !isToday
  
  let dateStr
  if (isToday) {
    dateStr = 'Heute'
  } else if (isTomorrow) {
    dateStr = 'Morgen'
  } else {
    dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }
  
  const timeStr = dueTime ? ` ${dueTime}` : ''
  
  return { text: dateStr + timeStr, isPast, isToday }
}

const updateNotes = (e) => {
  store.updateTodoNotes(props.todo.id, e.target.value)
}

const addSubtask = () => {
  if (!newSubtaskText.value.trim()) return
  store.addSubtask(props.todo.id, newSubtaskText.value)
  newSubtaskText.value = ''
}
</script>

<template>
  <li 
    class="todo-item card"
    :class="{ 'completed': todo.completed, 'active-focus': store.activeTodoId === todo.id }"
  >
    <div class="todo-main-row">
      <div class="todo-left">
        <button 
          @click="store.toggleTodo(todo.id)" 
          class="check-btn"
          :aria-label="todo.completed ? 'Mark update incomplete' : 'Mark as complete'"
        >
          <span v-if="todo.completed">✓</span>
        </button>
        
        <div class="todo-content">
          <span class="todo-text">{{ todo.text }}</span>
          <div class="todo-meta">
            <span class="category-tag">{{ todo.category }}</span>
            <span 
              class="priority-dot" 
              :style="{ backgroundColor: priorityColor(todo.priority) }"
              :title="todo.priority + ' Priority'"
            ></span>
            <span 
              v-if="todo.pomodoros > 0 || todo.estimatedPomodoros > 1" 
              class="pomodoro-badge" 
              title="Pomodoros: Erledigt / Geschätzt"
            >
              🍅 {{ todo.pomodoros }}/{{ todo.estimatedPomodoros }}
            </span>
            <span 
              v-if="formatDateTime(todo.dueDate, todo.dueTime)" 
              class="due-date-badge"
              :class="{ 
                'is-past': formatDateTime(todo.dueDate, todo.dueTime).isPast && !todo.completed,
                'is-today': formatDateTime(todo.dueDate, todo.dueTime).isToday 
              }"
            >
              📅 {{ formatDateTime(todo.dueDate, todo.dueTime).text }}
            </span>
             <span v-if="todo.subtasks && todo.subtasks.length > 0" class="subtask-badge">
              📎 {{ todo.subtasks.filter(s => s.completed).length }}/{{ todo.subtasks.length }}
            </span>
          </div>
        </div>
      </div>

      <div class="todo-actions">
        <!-- Expand Button -->
         <button 
          @click="toggleExpand" 
          class="icon-btn expand-btn"
          :class="{ 'is-expanded': isExpanded }"
          aria-label="Toggle details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <button 
          v-if="!todo.completed"
          @click="store.setFocusTodo(todo.id)"
          class="focus-btn"
          :class="{ 'is-focused': store.activeTodoId === todo.id }"
          title="Aufgabe fokussieren"
        >
          {{ store.activeTodoId === todo.id ? 'Fokussiert' : 'Fokus' }}
        </button>
        
        <button 
          @click="store.deleteTodo(todo.id)" 
          class="icon-btn delete-btn"
          title="Aufgabe löschen"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Expanded Details Section -->
    <div v-if="isExpanded" class="todo-details">
      <!-- Notes Section -->
      <div class="details-section">
        <label class="details-label">Notizen</label>
        <textarea 
          :value="todo.notes" 
          @input="updateNotes"
          class="notes-input"
          placeholder="Notizen hier hinzufügen..."
          rows="3"
        ></textarea>
      </div>

      <!-- Subtasks Section -->
      <div class="details-section">
        <label class="details-label">Unteraufgaben</label>
        <div class="subtask-list">
          <div v-for="subtask in todo.subtasks" :key="subtask.id" class="subtask-item">
            <input 
              type="checkbox" 
              :checked="subtask.completed" 
              @change="store.toggleSubtask(todo.id, subtask.id)"
              class="subtask-checkbox"
            />
            <span :class="{ 'subtask-done': subtask.completed }">{{ subtask.text }}</span>
            <button @click="store.deleteSubtask(todo.id, subtask.id)" class="subtask-delete">×</button>
          </div>
        </div>
        
        <div class="add-subtask-row">
          <input 
            v-model="newSubtaskText" 
            @keyup.enter="addSubtask"
            type="text" 
            placeholder="Neue Unteraufgabe..." 
            class="subtask-input"
          />
          <button @click="addSubtask" class="add-subtask-btn">+</button>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  flex-direction: column;
  padding: 0; /* Reset and move padding to children */
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  overflow: hidden;
}

.todo-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  width: 100%;
}

.todo-item.active-focus {
  border-left-color: var(--color-accent);
  background-color: #fafafa;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.todo-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.check-btn {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  transition: all 0.2s;
  flex-shrink: 0;
}

.check-btn:hover {
  border-color: var(--color-accent);
}

.todo-item.completed .check-btn {
  background-color: var(--color-border);
  border-color: var(--color-border);
  color: white;
}

.todo-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-text {
  font-weight: 500;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.category-tag {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.65rem;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pomodoro-badge {
  font-size: 0.7rem;
  color: var(--color-text);
  background: #fff0f0;
  padding: 1px 5px;
  border-radius: 4px;
}

.subtask-badge {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    background: #f0f0f0;
    padding: 1px 5px;
    border-radius: 4px;
}

.due-date-badge {
  font-size: 0.7rem;
  color: var(--color-text);
  background: #f0f8ff;
  padding: 1px 5px;
  border-radius: 4px;
}

.due-date-badge.is-today {
  background: #fff8e6;
  color: #b38600;
}

.due-date-badge.is-past {
  background: #ffe6e6;
  color: #cc3333;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: 0.6; /* Increased check visibility slightly */
  transition: opacity 0.2s;
}

.todo-item:hover .todo-actions,
.todo-item.active-focus .todo-actions,
.todo-item:focus-within .todo-actions { /* Show actions when typing in notes */
  opacity: 1;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 4px;
  border-radius: 4px;
  display: flex; 
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f0f0f0;
  color: var(--color-text);
}

.expand-btn {
    transition: transform 0.3s ease;
}

.expand-btn.is-expanded {
    transform: rotate(180deg);
}

.focus-btn {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
}

.focus-btn:hover,
.focus-btn.is-focused {
  color: var(--color-accent);
  background-color: #f0f0f0;
}

.delete-btn {
  font-size: 1.5rem;
  line-height: 1;
}

.delete-btn:hover {
  color: #e74c3c;
}

/* Expanded Section Styles */
.todo-details {
    padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
    margin-top: -4px; /* Pull closer to main row */
    border-top: 1px solid #f0f0f0;
    margin-left: 20px; /* Indent slightly */
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.details-section {
    margin-top: var(--spacing-md);
}

.details-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-bottom: 4px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.notes-input {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 8px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
    background-color: #fcfcfc;
}

.notes-input:focus {
    outline: none;
    border-color: var(--color-accent);
    background-color: white;
}

.subtask-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
}

.subtask-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.subtask-done {
    text-decoration: line-through;
    color: var(--color-text-muted);
}

.subtask-delete {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 1.1rem;
    opacity: 0;
    transition: opacity 0.2s;
}

.subtask-item:hover .subtask-delete {
    opacity: 1;
}

.subtask-delete:hover {
    color: #e74c3c;
}

.add-subtask-row {
    display: flex;
    gap: 8px;
}

.subtask-input {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 4px 8px;
    font-size: 0.875rem;
}

.subtask-input:focus {
    outline: none;
    border-color: var(--color-accent);
}

.add-subtask-btn {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--color-text-muted);
}

.add-subtask-btn:hover {
    background-color: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
}
</style>
