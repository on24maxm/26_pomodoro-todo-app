<script setup>
import { useGamificationStore } from '../stores/gamificationStore'

const gamification = useGamificationStore()

const emit = defineEmits(['openShop', 'openAchievements'])
</script>

<template>
  <div class="gamification-panel">
    <!-- Level & Rank Badge -->
    <div class="level-badge" @click="emit('openAchievements')" title="Errungenschaften anzeigen">
      <span class="rank-icon">{{ gamification.currentRank.icon }}</span>
      <div class="level-info">
        <span class="level-number">Lvl {{ gamification.level }}</span>
        <span class="rank-name">{{ gamification.currentRank.name }}</span>
      </div>
    </div>
    
    <!-- XP Progress Bar -->
    <div class="xp-container">
      <div class="xp-bar">
        <div 
          class="xp-fill" 
          :style="{ width: gamification.xpProgress + '%' }"
        ></div>
      </div>
      <span class="xp-text">{{ gamification.xp }} / {{ gamification.xpForNextLevel }} XP</span>
    </div>
    
    <!-- Coins -->
    <button class="coins-display" @click="emit('openShop')" title="Shop öffnen">
      <span class="coin-icon">🪙</span>
      <span class="coin-amount">{{ gamification.coins }}</span>
    </button>
  </div>
</template>

<style scoped>
.gamification-panel {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.level-badge:hover {
  background: rgba(255, 215, 0, 0.15);
}

.rank-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.level-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.level-number {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-text);
}

.rank-name {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.xp-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.xp-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.xp-text {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-align: center;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
}

.coins-display:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.coin-icon {
  font-size: 1rem;
}

.coin-amount {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1a1a1a;
}

/* Responsive */
@media (max-width: 600px) {
  .gamification-panel {
    padding: 6px 8px;
    gap: var(--spacing-sm);
  }
  
  .xp-container {
    min-width: 80px;
  }
  
  .rank-name {
    display: none;
  }
}
</style>
