<script setup>
import { useGamificationStore } from '../stores/gamificationStore'
import { computed } from 'vue'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const gamification = useGamificationStore()

const achievementsWithStatus = computed(() => {
  return gamification.achievementDefinitions.map(achievement => ({
    ...achievement,
    unlocked: gamification.unlockedAchievements.includes(achievement.id)
  }))
})

const unlockedCount = computed(() => {
  return gamification.unlockedAchievements.length
})

const totalCount = computed(() => {
  return gamification.achievementDefinitions.length
})

const progressPercent = computed(() => {
  return (unlockedCount.value / totalCount.value) * 100
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="achievements-modal card">
        <div class="modal-header">
          <h2>🏆 Errungenschaften</h2>
          <button @click="$emit('close')" class="close-btn" aria-label="Schließen">✕</button>
        </div>
        
        <!-- Progress Overview -->
        <div class="progress-overview">
          <div class="progress-stats">
            <span class="progress-count">{{ unlockedCount }} / {{ totalCount }}</span>
            <span class="progress-label">Freigeschaltet</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        
        <!-- Stats Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-icon">🍅</span>
            <span class="stat-value">{{ gamification.stats.totalPomodoros }}</span>
            <span class="stat-label">Pomodoros</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">✅</span>
            <span class="stat-value">{{ gamification.stats.totalTodosCompleted }}</span>
            <span class="stat-label">Todos</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{{ Math.floor(gamification.stats.totalFocusMinutes / 60) }}h</span>
            <span class="stat-label">Fokus</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <span class="stat-value">{{ gamification.stats.longestStreak }}</span>
            <span class="stat-label">Max Streak</span>
          </div>
        </div>
        
        <!-- Achievements Grid -->
        <div class="achievements-grid">
          <div 
            v-for="achievement in achievementsWithStatus" 
            :key="achievement.id"
            :class="['achievement-item', { unlocked: achievement.unlocked }]"
          >
            <div class="achievement-icon">
              <span v-if="achievement.unlocked">{{ achievement.icon }}</span>
              <span v-else class="locked-icon">🔒</span>
            </div>
            <div class="achievement-info">
              <span class="achievement-name">{{ achievement.name }}</span>
              <span class="achievement-description">{{ achievement.description }}</span>
            </div>
            <div v-if="achievement.unlocked" class="unlocked-badge">✓</div>
          </div>
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.achievements-modal {
  width: 95%;
  max-width: 550px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--color-text-muted);
  background: var(--color-bg);
}

.close-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.progress-overview {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.progress-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.progress-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.progress-bar {
  height: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ff8c00 100%);
  border-radius: 5px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 12px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  opacity: 0.5;
  transition: all 0.2s;
}

.achievement-item.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%);
  border-color: rgba(39, 174, 96, 0.3);
}

.achievement-icon {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.locked-icon {
  filter: grayscale(1);
  opacity: 0.5;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.achievement-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.achievement-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.unlocked-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 500px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
