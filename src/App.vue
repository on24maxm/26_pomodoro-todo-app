<script setup>
import { ref, onMounted } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoList from './components/TodoList.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import SettingsModal from './components/SettingsModal.vue'
import GamificationPanel from './components/GamificationPanel.vue'
import ItemShop from './components/ItemShop.vue'
import AchievementsModal from './components/AchievementsModal.vue'
import LevelUpNotification from './components/LevelUpNotification.vue'
import FileConnectionDialog from './components/FileConnectionDialog.vue'
import { useTodoStore } from './stores/todoStore'

const store = useTodoStore()
const showSettings = ref(false)
const showShop = ref(false)
const showAchievements = ref(false)
const showFileConnection = ref(false)
const isInitialized = ref(false)

// Auto-connect to saved file on startup
onMounted(async () => {
    // Only show connection dialog in Electron
    if (store.isElectronApp()) {
        const connected = await store.tryAutoConnect()
        
        // If no file connected and no saved path, show dialog
        if (!connected && !store.getSavedFilePath()) {
            showFileConnection.value = true
        }
    }
    isInitialized.value = true
})

const handleFileConnected = () => {
    showFileConnection.value = false
}

const handleSkipConnection = () => {
    showFileConnection.value = false
}

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
      
      <div class="header-right">
        <GamificationPanel 
          @openShop="showShop = true" 
          @openAchievements="showAchievements = true" 
        />
        <button @click="showSettings = true" class="settings-btn" title="Settings">
          Einstellungen
        </button>
      </div>
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
    <ItemShop :isOpen="showShop" @close="showShop = false" />
    <AchievementsModal :isOpen="showAchievements" @close="showAchievements = false" />
    <LevelUpNotification />
    <FileConnectionDialog 
      v-if="showFileConnection" 
      @connected="handleFileConnected" 
      @skip="handleSkipConnection" 
    />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
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

.header-right {
  display: flex;
  align-items: center;
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
  
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .header-right {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
