<script setup>
import { useTodoStore } from '../stores/todoStore'
import { computed } from 'vue'
import TodoItem from './TodoItem.vue'

const store = useTodoStore()

// Methods moved to TodoItem.vue

const sortOptions = [
  { key: 'priority', label: 'Priorität' },
  { key: 'category', label: 'Kategorie' },
  { key: 'date', label: 'Datum' }
]
</script>

<template>
  <div class="todo-list-container">
    <!-- Sort Controls -->
    <div v-if="store.todos.length > 0" class="sort-controls">
      <span class="sort-label">Sortieren nach:</span>
      <button 
        v-for="option in sortOptions" 
        :key="option.key"
        @click="store.setSortBy(option.key)"
        class="sort-btn"
        :class="{ 'active': store.sortBy === option.key }"
      >
        {{ option.label }}
        <span v-if="store.sortBy === option.key" class="sort-arrow">
          {{ store.sortOrder === 'desc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>
    
    <div v-if="store.todos.length === 0" class="empty-state">
      <p>Noch keine Aufgaben. Füge eine hinzu, um zu beginnen.</p>
    </div>

    <ul v-else class="todo-list">
      <TodoItem 
        v-for="todo in store.sortedTodos" 
        :key="todo.id" 
        :todo="todo" 
      />
    </ul>
  </div>
</template>

<style scoped>
.todo-list-container {
  margin-top: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl);
  font-style: italic;
}

.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.sort-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sort-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-btn:hover {
  background: #f0f0f0;
  color: var(--color-text);
}

.sort-btn.active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

.sort-arrow {
  font-size: 0.65rem;
}

/* All item styles moved to TodoItem.vue */
</style>
