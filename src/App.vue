<script setup>
import { ref } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useTodoStore } from './stores/todoStore'

const store = useTodoStore()
const showSettings = ref(false)

// Notification Logic for Due Todos
setInterval(() => {
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const currentDateTimeStr = now.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm

    store.todos.forEach(todo => {
        if (!todo.completed && todo.dueDate && todo.dueTime) {
            const todoDateTimeStr = `${todo.dueDate}T${todo.dueTime}`
            // Check if due time matches current minute (simple check to avoid spam, assuming interval runs every minute approx)
            // Better: Check if within last minute to catch slightly delayed checks
            // For simplicity and robustness in this demo: exact match of HH:mm string
             if (todoDateTimeStr === currentDateTimeStr) {
                new Notification('Aufgabe fällig!', {
                    body: `"${todo.text}" ist jetzt fällig.`,
                    icon: '/favicon.ico'
                })
             }
        }
    })
}, 60000) // Check every minute

// Request permission on mount
if (Notification.permission === 'default') {
    Notification.requestPermission()
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <h1 class="logo">Pomodo.</h1>
        <span class="daily-count">
            Heute: {{ store.dailyStats.count }} 🍅
            <span v-if="store.dailyStats.totalTime > 0" class="daily-time">
                ({{ Math.floor(store.dailyStats.totalTime / 60) }}h {{ store.dailyStats.totalTime % 60 }}m)
            </span>
        </span>
      </div>
      <button @click="showSettings = true" class="settings-btn" title="Settings">
        Einstellungen
      </button>
    </header>

    <main class="main-layout">
      <!-- Left Column: Todos -->
      <section class="todo-section">
        <TodoInput />
        <TodoList />
      </section>

      <!-- Right Column: Timer -->
      <section class="timer-section">
        <TimerDisplay />
      </section>
    </main>

    <SettingsModal :isOpen="showSettings" @close="showSettings = false" />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: -1px;
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.daily-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.daily-time {
    margin-left: 4px;
    font-weight: 500;
}

.settings-btn {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.settings-btn:hover {
  text-decoration-color: var(--color-text-muted);
  color: var(--color-text);
}

/* Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .main-layout {
    grid-template-columns: 1.2fr 0.8fr; /* More space for todos */
    align-items: start;
  }

  .timer-section {
    order: 2; /* Timer on right */
  }
}

@media (max-width: 767px) {
  .timer-section {
    order: -1; /* Timer on top for mobile */
    margin-bottom: var(--spacing-lg);
  }
}
</style>
