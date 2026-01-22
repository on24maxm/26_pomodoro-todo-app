<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import { useTimerSounds } from '../composables/useTimerSounds'

const store = useTodoStore()
const { playStartSound, playTickSound, playCompleteSound } = useTimerSounds()

// Timer State
const timeLeft = ref(store.timerSettings.work * 60)
const isRunning = ref(false)
const mode = ref('work') // 'work', 'shortBreak', 'longBreak'
let intervalId = null

// Progress Calculation
const originalDuration = computed(() => {
  if (mode.value === 'work') return store.timerSettings.work * 60
  if (mode.value === 'shortBreak') return store.timerSettings.shortBreak * 60
  return store.timerSettings.longBreak * 60
})

const progress = computed(() => {
  const fraction = timeLeft.value / originalDuration.value
  const array = 283 // Circumference of radius 45 (2 * pi * 45)
  return array - (fraction * array)
})

// Timer Logic
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  if (timeLeft.value === 0) return
  isRunning.value = true
  playStartSound()
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) {
      // Play tick sound for last 5 seconds
      if (timeLeft.value <= 5) {
        playTickSound()
      }
      timeLeft.value--
    } else {
      pauseTimer()
      playCompleteSound()
      if (mode.value === 'work') {
        store.completePomodoro()
      }
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (intervalId) clearInterval(intervalId)
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = originalDuration.value
}

const changeMode = (newMode) => {
  mode.value = newMode
  resetTimer()
}

// Watch for setting changes to update timer if not running
watch(() => store.timerSettings, () => {
  if (!isRunning.value) {
    resetTimer()
  }
}, { deep: true })

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="timer-display-container card">
    <!-- Active Focus Header -->
    <div class="focus-header">
      <span class="label">Aktueller Fokus</span>
      <h2 v-if="store.activeTodo" class="focus-task-name">
        {{ store.activeTodo.text }}
      </h2>
      <h2 v-else class="focus-task-placeholder">
        Wähle eine Aufgabe zum Fokussieren
      </h2>
    </div>

    <!-- Timer Circle -->
    <div class="timer-circle-wrapper">
      <svg class="timer-svg" viewBox="0 0 100 100">
        <!-- Background Circle -->
        <circle 
          cx="50" cy="50" r="45" 
          class="circle-bg"
        />
        <!-- Progress Circle -->
        <circle 
          cx="50" cy="50" r="45" 
          class="circle-progress"
          :stroke-dasharray="283"
          :stroke-dashoffset="progress"
        />
      </svg>
      <div class="timer-text">
        {{ formattedTime }}
      </div>
    </div>

    <!-- Controls -->
    <div class="timer-controls">
      <button 
        @click="toggleTimer" 
        class="control-btn main-btn"
        :class="{ 'running': isRunning }"
      >
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button @click="resetTimer" class="control-btn reset-btn">
        Reset
      </button>
    </div>

    <!-- Mode Switcher -->
    <div class="mode-switcher">
      <button 
        @click="changeMode('work')" 
        class="mode-btn"
        :class="{ active: mode === 'work' }"
      >
        Fokus
      </button>
      <button 
        @click="changeMode('shortBreak')" 
        class="mode-btn"
        :class="{ active: mode === 'shortBreak' }"
      >
        Kurze Pause
      </button>
      <button 
        @click="changeMode('longBreak')" 
        class="mode-btn"
        :class="{ active: mode === 'longBreak' }"
      >
        Lange Pause
      </button>
    </div>
  </div>
</template>

<style scoped>
.timer-display-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  /* Sticky interaction if needed */
  position: sticky;
  top: 2rem;
}

.focus-header {
  margin-bottom: var(--spacing-lg);
  min-height: 80px; /* Prevent layout shift */
}

.label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 2px;
  color: var(--color-text-muted);
}

.focus-task-name {
  font-size: 1.5rem;
  margin-top: var(--spacing-sm);
  line-height: 1.2;
}

.focus-task-placeholder {
  font-size: 1.25rem;
  margin-top: var(--spacing-sm);
  color: var(--color-text-muted);
  font-weight: 400;
  font-style: italic;
}

/* Timer Circle */
.timer-circle-wrapper {
  position: relative;
  width: 250px;
  height: 250px;
  margin-bottom: var(--spacing-lg);
}

.timer-svg {
  transform: rotate(-90deg); /* Start from top */
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 2;
}

.circle-progress {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3.5rem;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: -2px;
}

/* Controls */
.timer-controls {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.control-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 50px; /* Pill shape for controls */
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 100px;
}

.main-btn {
  background-color: var(--color-accent);
  color: white;
}

.main-btn.running {
  background-color: transparent;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.reset-btn {
  color: var(--color-text-muted);
}

.reset-btn:hover {
  color: var(--color-text);
}

/* Mode Switcher */
.mode-switcher {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--color-bg);
  padding: 4px;
  border-radius: 50px;
}

.mode-btn {
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.mode-btn.active {
  background-color: var(--color-surface);
  color: var(--color-accent);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
}
</style>
