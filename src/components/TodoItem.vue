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

const fileInputRef = ref(null)

const triggerFileInput = () => {
  fileInputRef.value.click()
}

const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        src: e.target.result,
        name: file.name
      }
      store.addImage(props.todo.id, imageData)
    }
    reader.readAsDataURL(file)
  })
  
  // Reset input
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const removeImage = (imageId) => {
  store.removeImage(props.todo.id, imageId)
}

const selectedImage = ref(null)

const openImage = (image) => {
  selectedImage.value = image
}

const closeImage = () => {
  selectedImage.value = null
}

// Edit Mode Logic
const isEditing = ref(false)
const editData = ref({})

const startEdit = () => {
    editData.value = JSON.parse(JSON.stringify(props.todo))
    // Ensure repeat exists
    if (!editData.value.repeat) editData.value.repeat = 'None'
    isEditing.value = true
}

const cancelEdit = () => {
    isEditing.value = false
}

const saveEdit = () => {
    store.updateTodo(props.todo.id, editData.value)
    isEditing.value = false
}
</script>

<template>
  <li 
    class="todo-item card"
    :class="{ 'completed': todo.completed, 'active-focus': store.activeTodoId === todo.id }"
  >
      <div class="todo-main-row">
        <!-- Edit Mode -->
        <div v-if="isEditing" class="edit-mode-container">
            <input v-model="editData.text" class="edit-input-text" placeholder="Aufgabe..." @keyup.enter="saveEdit" />
            
            <div class="edit-options">
                <select v-model="editData.category" class="edit-select">
                     <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                
                <select v-model="editData.priority" class="edit-select">
                    <option value="Low">Niedrig</option>
                    <option value="Medium">Mittel</option>
                    <option value="High">Hoch</option>
                </select>

                 <select v-model="editData.repeat" class="edit-select">
                    <option value="None">Keine Wiederholung</option>
                    <option value="Daily">Täglich</option>
                    <option value="Weekly">Wöchentlich</option>
                    <option value="Monthly">Monatlich</option>
                </select>
                
                <div class="edit-estimate">
                    <span>🍅</span>
                    <input v-model.number="editData.estimatedPomodoros" type="number" min="1" max="50" class="edit-input-number" />
                </div>

                <div class="edit-date">
                     <input v-model="editData.dueDate" type="date" class="edit-input-date" />
                     <input v-model="editData.dueTime" type="time" class="edit-input-time" />
                </div>
            </div>

            <div class="edit-actions">
                <button @click="saveEdit" class="save-btn">Speichern</button>
                <button @click="cancelEdit" class="cancel-btn">Abbrechen</button>
            </div>
        </div>

        <!-- View Mode -->
        <div v-else class="view-mode-container">
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
                    <span v-if="todo.repeat && todo.repeat !== 'None'" class="repeat-badge" :title="'Wiederholung: ' + todo.repeat">
                        🔄 {{ todo.repeat }}
                    </span>
                </div>
                </div>
            </div>

            <div class="todo-actions">
                 <!-- Edit Button -->
                <button @click="startEdit" class="icon-btn edit-btn" title="Bearbeiten">
                    ✏️
                </button>

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


       <!-- Images Section -->
       <div class="details-section">
        <div class="section-header">
          <label class="details-label">Bilder</label>
          <button @click="triggerFileInput" class="add-image-btn" title="Bild hinzufügen">
            📷+
          </button>
          <input 
            ref="fileInputRef"
            type="file" 
            multiple 
            accept="image/*" 
            class="hidden-file-input"
            @change="handleFileUpload"
          />
        </div>
        
        <div v-if="todo.images && todo.images.length > 0" class="image-grid">
          <div v-for="image in todo.images" :key="image.id" class="image-item">
            <img 
              :src="image.src" 
              :alt="image.name" 
              class="todo-image" 
              @click="openImage(image)"
            />
            <button @click.stop="removeImage(image.id)" class="delete-image-btn" title="Entfernen">×</button>
          </div>
        </div>
        <div v-else class="empty-images">
          <span class="empty-text">Keine Bilder vorhanden</span>
        </div>
      </div>


    </div>
  </li>

  <Teleport to="body">
    <div v-if="selectedImage" class="image-modal-backdrop" @click="closeImage">
      <div class="image-modal-content" @click.stop>
        <button class="modal-close-btn" @click="closeImage">×</button>
        <img :src="selectedImage.src" :alt="selectedImage.name" class="modal-image" />
      </div>
    </div>
  </Teleport>
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
  justify-content: space-between; /* This might need to change for edit mode centering? */
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

.repeat-badge {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    background: #eef2f5;
    padding: 1px 5px;
    border-radius: 4px;
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

/* Edit Mode Styles */
.edit-mode-container {
    width: 100%;
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.view-mode-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    width: 100%;
}

.edit-input-text {
    width: 100%;
    padding: 6px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 1rem;
}

.edit-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.edit-select, .edit-input-number, .edit-input-date, .edit-input-time {
    padding: 4px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.8rem;
}

.edit-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.save-btn {
    background-color: var(--color-accent);
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.cancel-btn {
    background-color: transparent;
    border: 1px solid var(--color-border);
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
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


/* Image Section Styles */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.add-image-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
  color: var(--color-text-muted);
}

.add-image-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.hidden-file-input {
  display: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}



.image-item:hover .todo-image {
  transform: scale(1.05);
}

.delete-image-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.image-item:hover .delete-image-btn {
  opacity: 1;
}

.delete-image-btn:hover {
  background: rgba(231, 76, 60, 0.9);
}

.empty-images {
  padding: 8px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed var(--color-border);
}

.empty-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Modal Styles */
.image-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  animation: scaleIn 0.2s ease-out;
}

.modal-close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.modal-close-btn:hover {
  opacity: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
