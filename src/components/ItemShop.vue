<script setup>
import { useGamificationStore } from '../stores/gamificationStore'
import { useSounds } from '../composables/useSounds'
import { ref, computed } from 'vue'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const gamification = useGamificationStore()
const sounds = useSounds()

const selectedCategory = ref('all')

const categories = [
  { id: 'all', name: 'Alle', icon: '🏪' },
  { id: 'theme', name: 'Themes', icon: '🎨' },
  { id: 'cosmetic', name: 'Kosmetik', icon: '✨' },
  { id: 'consumable', name: 'Verbrauchbar', icon: '⚡' },
]

const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return gamification.shopItems
  }
  return gamification.shopItems.filter(item => item.type === selectedCategory.value)
})

const purchaseMessage = ref(null)

function buyItem(itemId) {
  const result = gamification.purchaseItem(itemId)
  purchaseMessage.value = result
  
  if (result.success) {
    sounds.playPurchase()
  } else {
    sounds.playError()
  }
  
  setTimeout(() => {
    purchaseMessage.value = null
  }, 2500)
}

function activateItem(itemId) {
  const result = gamification.activateItem(itemId)
  purchaseMessage.value = result
  
  if (result.success) {
    sounds.playClick()
  }
  
  setTimeout(() => {
    purchaseMessage.value = null
  }, 2500)
}

function deactivateItem(itemId) {
  const item = gamification.shopItems.find(i => i.id === itemId)
  if (!item) return
  
  if (item.type === 'theme') {
    gamification.deactivateTheme()
    purchaseMessage.value = { success: true, message: 'Theme deaktiviert' }
  } else if (item.type === 'cosmetic') {
    gamification.activateItem(itemId) // Toggle off
    purchaseMessage.value = { success: true, message: `${item.name} deaktiviert` }
  }
  
  sounds.playClick()
  
  setTimeout(() => {
    purchaseMessage.value = null
  }, 2500)
}

function isOwned(itemId) {
  return gamification.purchasedItems.includes(itemId)
}

function isActive(itemId) {
  return gamification.isItemActive(itemId)
}

function canAfford(price) {
  return gamification.coins >= price
}

function canActivate(item) {
  return item.type === 'theme' || item.type === 'cosmetic'
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="shop-modal card">
        <div class="shop-header">
          <h2>🏪 Item Shop</h2>
          <div class="coins-display">
            <span class="coin-icon">🪙</span>
            <span class="coin-amount">{{ gamification.coins }}</span>
          </div>
          <button @click="$emit('close')" class="close-btn" aria-label="Schließen">✕</button>
        </div>
        
        <!-- Category Filter -->
        <div class="category-tabs">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            :class="['category-tab', { active: selectedCategory === cat.id }]"
            @click="selectedCategory = cat.id"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </button>
        </div>
        
        <!-- Purchase Message -->
        <Transition name="fade">
          <div v-if="purchaseMessage" :class="['purchase-message', purchaseMessage.success ? 'success' : 'error']">
            {{ purchaseMessage.message }}
          </div>
        </Transition>
        
        <!-- Items Grid -->
        <div class="items-grid">
          <div 
            v-for="item in filteredItems" 
            :key="item.id"
            :class="['shop-item', { owned: isOwned(item.id), 'cannot-afford': !canAfford(item.price) && !isOwned(item.id) }]"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-description">{{ item.description }}</span>
            </div>
            <div class="item-action">
              <!-- Owned but not yet active: show activate button -->
              <template v-if="isOwned(item.id) && item.type !== 'consumable'">
                <div v-if="canActivate(item) && isActive(item.id)" class="active-actions">
                  <span class="active-indicator">✓ Aktiv</span>
                  <button 
                    class="deactivate-btn"
                    @click="deactivateItem(item.id)"
                    title="Deaktivieren"
                  >
                    ✕
                  </button>
                </div>
                <button 
                  v-else-if="canActivate(item)"
                  class="activate-btn"
                  @click="activateItem(item.id)"
                >
                  Aktivieren
                </button>
                <span v-else class="owned-badge">Gekauft ✓</span>
              </template>
              
              <!-- Not owned: show buy button -->
              <button 
                v-else
                :class="['buy-btn', { disabled: !canAfford(item.price) }]"
                :disabled="!canAfford(item.price)"
                @click="buyItem(item.id)"
              >
                <span class="price">🪙 {{ item.price }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="shop-footer">
          <small>Verdiene Münzen durch Level-Ups! Pro Level erhältst du Level × 10 Münzen.</small>
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

.shop-modal {
  width: 95%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.shop-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.shop-header h2 {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: var(--radius-md);
  font-weight: 700;
}

.coin-icon {
  font-size: 1rem;
}

.coin-amount {
  color: #1a1a1a;
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

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.2s;
  color: var(--color-text);
}

.category-tab.active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

.category-tab:not(.active):hover {
  background: var(--color-border);
}

.purchase-message {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.purchase-message.success {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.purchase-message.error {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 14px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.shop-item:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
}

.shop-item.owned {
  background: rgba(39, 174, 96, 0.08);
  border-color: rgba(39, 174, 96, 0.3);
}

.shop-item.owned.item-active {
  background: rgba(187, 134, 252, 0.1);
  border-color: rgba(187, 134, 252, 0.4);
}

.shop-item.cannot-afford {
  opacity: 0.6;
}

.item-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-description {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.item-action {
  display: flex;
  align-items: center;
}

.owned-badge {
  padding: 6px 12px;
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.activate-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.activate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.active-badge {
  padding: 8px 16px;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  cursor: pointer;
}

.active-badge:hover {
  opacity: 0.9;
}

.active-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-indicator {
  padding: 8px 12px;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
}

.deactivate-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.deactivate-btn:hover {
  background: #e74c3c;
  color: white;
}

.buy-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: var(--radius-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.buy-btn:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.buy-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price {
  color: #1a1a1a;
  font-size: 0.85rem;
}

.shop-footer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
