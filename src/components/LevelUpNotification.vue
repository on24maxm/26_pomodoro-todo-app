<script setup>
import { useGamificationStore } from '../stores/gamificationStore'
import { useSounds } from '../composables/useSounds'
import { computed, watch, ref } from 'vue'

const gamification = useGamificationStore()
const sounds = useSounds()

const showConfetti = ref(false)

watch(() => gamification.levelUpNotification, (newVal) => {
  if (newVal) {
    showConfetti.value = true
    sounds.playLevelUp()
    setTimeout(() => {
      showConfetti.value = false
    }, 3000)
  }
})

watch(() => gamification.achievementNotification, (newVal) => {
  if (newVal) {
    sounds.playAchievement()
  }
})
</script>

<template>
  <!-- Level Up Notification -->
  <Transition name="level-up">
    <div v-if="gamification.levelUpNotification" class="level-up-overlay">
      <div class="level-up-card">
        <!-- Confetti Effect -->
        <div v-if="showConfetti" class="confetti-container">
          <div v-for="i in 20" :key="i" class="confetti" :style="{ '--delay': i * 0.1 + 's', '--x': (Math.random() * 200 - 100) + 'px' }"></div>
        </div>
        
        <div class="level-up-content">
          <div class="level-up-icon">🎉</div>
          <h2 class="level-up-title">LEVEL UP!</h2>
          
          <div class="new-level">
            <span class="rank-icon">{{ gamification.levelUpNotification.rank.icon }}</span>
            <span class="level-number">Level {{ gamification.levelUpNotification.level }}</span>
          </div>
          
          <div class="rank-info">
            <span class="rank-name">{{ gamification.levelUpNotification.rank.name }}</span>
          </div>
          
          <div class="rewards">
            <div class="reward-item">
              <span class="reward-icon">🪙</span>
              <span class="reward-amount">+{{ gamification.levelUpNotification.coinsEarned }}</span>
            </div>
          </div>
          
          <button @click="gamification.dismissLevelUpNotification()" class="dismiss-btn">
            Weiter
          </button>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- Achievement Notification -->
  <Transition name="achievement">
    <div v-if="gamification.achievementNotification" class="achievement-toast">
      <div class="achievement-content">
        <span class="achievement-icon">{{ gamification.achievementNotification.icon }}</span>
        <div class="achievement-text">
          <span class="achievement-label">Errungenschaft freigeschaltet!</span>
          <span class="achievement-name">{{ gamification.achievementNotification.name }}</span>
        </div>
      </div>
      <button @click="gamification.dismissAchievementNotification()" class="toast-close">✕</button>
    </div>
  </Transition>
</template>

<style scoped>
/* Level Up Overlay */
.level-up-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.level-up-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: var(--radius-lg);
  padding: 40px 60px;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 215, 0, 0.3);
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  left: 50%;
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #ffd700, #ff8c00, #ff6347);
  animation: confetti-fall 2s ease-out var(--delay) forwards;
  transform: translateX(var(--x));
}

.confetti:nth-child(odd) {
  background: linear-gradient(45deg, #00ff88, #00ccff);
  width: 8px;
  height: 8px;
}

.confetti:nth-child(3n) {
  background: linear-gradient(45deg, #ff6b9d, #c44ce1);
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

@keyframes confetti-fall {
  0% {
    transform: translateX(var(--x)) translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateX(calc(var(--x) * 1.5)) translateY(350px) rotate(720deg);
    opacity: 0;
  }
}

.level-up-content {
  position: relative;
  z-index: 1;
}

.level-up-icon {
  font-size: 4rem;
  margin-bottom: 10px;
  animation: bounce 0.6s ease infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.level-up-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ffd700, #ff8c00, #ffd700);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
  margin: 0 0 20px;
  text-transform: uppercase;
  letter-spacing: 4px;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.new-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rank-icon {
  font-size: 3rem;
}

.level-number {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.rank-info {
  margin-bottom: 24px;
}

.rank-name {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 3px;
}

.rewards {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffd700;
}

.dismiss-btn {
  padding: 12px 40px;
  background: linear-gradient(90deg, #ffd700 0%, #ff8c00 100%);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dismiss-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.4);
}

/* Transitions */
.level-up-enter-active {
  animation: level-up-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.level-up-leave-active {
  animation: level-up-out 0.3s ease-in forwards;
}

@keyframes level-up-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes level-up-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Achievement Toast */
.achievement-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 16px 20px;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 30px rgba(39, 174, 96, 0.4);
  z-index: 250;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text {
  display: flex;
  flex-direction: column;
}

.achievement-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.achievement-name {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.toast-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 0.8rem;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Achievement Transition */
.achievement-enter-active {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.achievement-leave-active {
  animation: slide-out-right 0.3s ease-in forwards;
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
</style>
