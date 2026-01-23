import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useGamificationStore = defineStore('gamification', () => {
    // --- State ---
    const xp = ref(0)
    const level = ref(1)
    const coins = ref(0)
    const totalCoinsEarned = ref(0)
    const purchasedItems = ref([])
    const activeTheme = ref('default') // 'default', 'theme_dark', 'theme_nature', 'theme_ocean', 'theme_sunset'
    const activeCosmetics = ref([]) // ['golden_frame', 'sound_pack']
    const stats = ref({
        totalPomodoros: 0,
        totalTodosCompleted: 0,
        totalFocusMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        dailyPomodoros: 0,
        dailyTodos: 0
    })

    // Achievement definitions
    const achievementDefinitions = [
        { id: 'first_pomodoro', name: 'Erste Tomate', icon: '🍅', description: '1 Pomodoro abgeschlossen', condition: (s) => s.totalPomodoros >= 1 },
        { id: 'first_todo', name: 'Erste Aufgabe', icon: '📝', description: '1 Todo abgeschlossen', condition: (s) => s.totalTodosCompleted >= 1 },
        { id: 'fire_streak', name: 'Feuer-Streak', icon: '🔥', description: '5 Pomodoros an einem Tag', condition: (s) => s.dailyPomodoros >= 5 },
        { id: 'diligent', name: 'Fleißig', icon: '💯', description: '10 Todos abgeschlossen', condition: (s) => s.totalTodosCompleted >= 10 },
        { id: 'productivity_monster', name: 'Produktivitäts-Monster', icon: '🚀', description: '50 Todos abgeschlossen', condition: (s) => s.totalTodosCompleted >= 50 },
        { id: 'marathon', name: 'Marathon', icon: '⏱️', description: '10 Stunden fokussiert', condition: (s) => s.totalFocusMinutes >= 600 },
        { id: 'level_10', name: 'Level 10', icon: '🏆', description: 'Level 10 erreicht', condition: (s, l) => l >= 10 },
        { id: 'level_25', name: 'Level 25', icon: '👑', description: 'Level 25 erreicht', condition: (s, l) => l >= 25 },
        { id: 'level_50', name: 'Level 50', icon: '🌟', description: 'Level 50 erreicht', condition: (s, l) => l >= 50 },
        { id: 'collector', name: 'Sammler', icon: '💰', description: '100 Münzen gesammelt', condition: (s, l, tc) => tc >= 100 },
        { id: 'first_purchase', name: 'Erster Einkauf', icon: '🛒', description: 'Erstes Item gekauft', condition: (s, l, tc, pi) => pi.length >= 1 },
        { id: 'daily_routine', name: 'Tägliche Routine', icon: '📅', description: '7 Tage Streak', condition: (s) => s.longestStreak >= 7 },
        { id: 'focus_master', name: 'Fokus-Meister', icon: '🎯', description: '100 Pomodoros insgesamt', condition: (s) => s.totalPomodoros >= 100 },
        { id: 'hardcore', name: 'Hardcore', icon: '💎', description: '200 Pomodoros insgesamt', condition: (s) => s.totalPomodoros >= 200 },
    ]

    const unlockedAchievements = ref([])

    // Shop items
    const shopItems = ref([
        { id: 'theme_dark', name: 'Dunkles Theme', icon: '🌙', price: 50, description: 'Dark Mode freischalten', type: 'theme' },
        { id: 'theme_nature', name: 'Farbpalette Natur', icon: '🌿', price: 30, description: 'Grün-braunes Theme', type: 'theme' },
        { id: 'theme_ocean', name: 'Farbpalette Ocean', icon: '🌊', price: 30, description: 'Blaues Theme', type: 'theme' },
        { id: 'theme_sunset', name: 'Farbpalette Sunset', icon: '🌅', price: 30, description: 'Orange-pinkes Theme', type: 'theme' },
        { id: 'bonus_break', name: 'Bonus-Pause', icon: '⏰', price: 100, description: '+5 Min Pause einmalig', type: 'consumable' },
        { id: 'sound_pack', name: 'Sound Pack', icon: '🎵', price: 75, description: 'Neue Timer-Sounds', type: 'cosmetic' },
        { id: 'golden_frame', name: 'Goldene Rahmen', icon: '✨', price: 150, description: 'Premium Todo-Styling', type: 'cosmetic' },
        { id: 'double_xp', name: 'Doppelte XP', icon: '⚡', price: 200, description: '1 Stunde doppelte XP', type: 'consumable' },
    ])

    // Notification state
    const levelUpNotification = ref(null)
    const achievementNotification = ref(null)

    // --- Rank System ---
    const ranks = [
        { minLevel: 1, name: 'Anfänger', icon: '🌱' },
        { minLevel: 6, name: 'Lehrling', icon: '⭐' },
        { minLevel: 11, name: 'Geselle', icon: '🔥' },
        { minLevel: 16, name: 'Experte', icon: '💪' },
        { minLevel: 21, name: 'Meister', icon: '⚡' },
        { minLevel: 31, name: 'Großmeister', icon: '🎯' },
        { minLevel: 41, name: 'Champion', icon: '👑' },
        { minLevel: 51, name: 'Virtuose', icon: '💎' },
        { minLevel: 61, name: 'Elite', icon: '🏆' },
        { minLevel: 81, name: 'Legende', icon: '🌟' },
    ]

    // --- Computed ---
    const currentRank = computed(() => {
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (level.value >= ranks[i].minLevel) {
                return ranks[i]
            }
        }
        return ranks[0]
    })

    const xpForNextLevel = computed(() => {
        return level.value * 100
    })

    const xpProgress = computed(() => {
        return Math.min((xp.value / xpForNextLevel.value) * 100, 100)
    })

    const xpToNextLevel = computed(() => {
        return xpForNextLevel.value - xp.value
    })

    // --- Persistence ---
    function saveToLocalStorage() {
        const data = {
            xp: xp.value,
            level: level.value,
            coins: coins.value,
            totalCoinsEarned: totalCoinsEarned.value,
            purchasedItems: purchasedItems.value,
            activeTheme: activeTheme.value,
            activeCosmetics: activeCosmetics.value,
            unlockedAchievements: unlockedAchievements.value,
            stats: stats.value
        }
        localStorage.setItem('pomodoro-gamification-data', JSON.stringify(data))
    }

    function loadFromLocalStorage() {
        const data = localStorage.getItem('pomodoro-gamification-data')
        if (data) {
            try {
                const parsed = JSON.parse(data)
                if (parsed.xp !== undefined) xp.value = parsed.xp
                if (parsed.level !== undefined) level.value = parsed.level
                if (parsed.coins !== undefined) coins.value = parsed.coins
                if (parsed.totalCoinsEarned !== undefined) totalCoinsEarned.value = parsed.totalCoinsEarned
                if (parsed.purchasedItems) purchasedItems.value = parsed.purchasedItems
                if (parsed.activeTheme) activeTheme.value = parsed.activeTheme
                if (parsed.activeCosmetics) activeCosmetics.value = parsed.activeCosmetics
                if (parsed.unlockedAchievements) unlockedAchievements.value = parsed.unlockedAchievements
                if (parsed.stats) stats.value = { ...stats.value, ...parsed.stats }
            } catch (e) {
                console.error('Failed to parse gamification data', e)
            }
        }
    }

    // Initialize
    loadFromLocalStorage()

    // Apply theme on load
    applyTheme(activeTheme.value)

    // Check for daily reset
    function checkDailyReset() {
        const today = new Date().toLocaleDateString()
        if (stats.value.lastActiveDate !== today) {
            // Check streak
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toLocaleDateString()

            if (stats.value.lastActiveDate === yesterdayStr) {
                stats.value.currentStreak++
                if (stats.value.currentStreak > stats.value.longestStreak) {
                    stats.value.longestStreak = stats.value.currentStreak
                }
            } else if (stats.value.lastActiveDate !== null) {
                stats.value.currentStreak = 1
            } else {
                stats.value.currentStreak = 1
            }

            stats.value.dailyPomodoros = 0
            stats.value.dailyTodos = 0
            stats.value.lastActiveDate = today
        }
    }

    // Watch for changes
    watch([xp, level, coins, totalCoinsEarned, purchasedItems, activeTheme, activeCosmetics, unlockedAchievements, stats], () => {
        saveToLocalStorage()
    }, { deep: true })

    // --- Actions ---
    function addXP(amount, source = 'unknown') {
        checkDailyReset()

        // Check for double XP boost
        // (Could add time-limited boost logic here)

        xp.value += amount

        // Check for level up
        while (xp.value >= xpForNextLevel.value) {
            xp.value -= xpForNextLevel.value
            levelUp()
        }

        // Update stats
        if (source === 'pomodoro') {
            stats.value.totalPomodoros++
            stats.value.dailyPomodoros++
        } else if (source === 'todo') {
            stats.value.totalTodosCompleted++
            stats.value.dailyTodos++
        }

        // Check achievements
        checkAchievements()
    }

    function addFocusMinutes(minutes) {
        stats.value.totalFocusMinutes += minutes
        checkAchievements()
    }

    function levelUp() {
        level.value++
        const coinsEarned = level.value * 10
        coins.value += coinsEarned
        totalCoinsEarned.value += coinsEarned

        // Trigger notification
        levelUpNotification.value = {
            level: level.value,
            rank: currentRank.value,
            coinsEarned: coinsEarned,
            timestamp: Date.now()
        }

        // Auto-clear after 5 seconds
        setTimeout(() => {
            if (levelUpNotification.value?.timestamp === levelUpNotification.value?.timestamp) {
                levelUpNotification.value = null
            }
        }, 5000)

        checkAchievements()
    }

    function checkAchievements() {
        for (const achievement of achievementDefinitions) {
            if (!unlockedAchievements.value.includes(achievement.id)) {
                if (achievement.condition(stats.value, level.value, totalCoinsEarned.value, purchasedItems.value)) {
                    unlockAchievement(achievement)
                }
            }
        }
    }

    function unlockAchievement(achievement) {
        unlockedAchievements.value.push(achievement.id)

        // Bonus XP for achievement
        xp.value += 50

        // Trigger notification
        achievementNotification.value = {
            ...achievement,
            timestamp: Date.now()
        }

        // Auto-clear after 4 seconds
        setTimeout(() => {
            achievementNotification.value = null
        }, 4000)
    }

    function purchaseItem(itemId) {
        const item = shopItems.value.find(i => i.id === itemId)
        if (!item) return { success: false, message: 'Item nicht gefunden' }

        if (purchasedItems.value.includes(itemId) && item.type !== 'consumable') {
            return { success: false, message: 'Bereits gekauft' }
        }

        if (coins.value < item.price) {
            return { success: false, message: 'Nicht genug Münzen' }
        }

        coins.value -= item.price

        if (item.type !== 'consumable') {
            purchasedItems.value.push(itemId)
        }

        checkAchievements()

        return { success: true, message: `${item.name} gekauft!`, item }
    }

    function hasItem(itemId) {
        return purchasedItems.value.includes(itemId)
    }

    function activateItem(itemId) {
        const item = shopItems.value.find(i => i.id === itemId)
        if (!item) return { success: false, message: 'Item nicht gefunden' }

        if (!hasItem(itemId) && item.type !== 'consumable') {
            return { success: false, message: 'Item nicht gekauft' }
        }

        if (item.type === 'theme') {
            activeTheme.value = itemId
            applyTheme(itemId)
            return { success: true, message: `${item.name} aktiviert!` }
        }

        if (item.type === 'cosmetic') {
            if (activeCosmetics.value.includes(itemId)) {
                activeCosmetics.value = activeCosmetics.value.filter(id => id !== itemId)
                applyCosmetics()
                return { success: true, message: `${item.name} deaktiviert!` }
            } else {
                activeCosmetics.value.push(itemId)
                applyCosmetics()
                return { success: true, message: `${item.name} aktiviert!` }
            }
        }

        return { success: false, message: 'Dieses Item kann nicht aktiviert werden' }
    }

    function deactivateTheme() {
        activeTheme.value = 'default'
        applyTheme('default')
    }

    function applyTheme(themeId) {
        const root = document.documentElement

        // Remove all theme classes first
        root.classList.remove('theme-dark', 'theme-nature', 'theme-ocean', 'theme-sunset')

        // Apply the selected theme
        if (themeId && themeId !== 'default') {
            root.classList.add(themeId.replace('_', '-'))
        }
    }

    function applyCosmetics() {
        const root = document.documentElement

        // Golden frame
        if (activeCosmetics.value.includes('golden_frame')) {
            root.classList.add('cosmetic-golden-frame')
        } else {
            root.classList.remove('cosmetic-golden-frame')
        }
    }

    function isItemActive(itemId) {
        const item = shopItems.value.find(i => i.id === itemId)
        if (!item) return false

        if (item.type === 'theme') {
            return activeTheme.value === itemId
        }

        if (item.type === 'cosmetic') {
            return activeCosmetics.value.includes(itemId)
        }

        return false
    }

    function dismissLevelUpNotification() {
        levelUpNotification.value = null
    }

    function dismissAchievementNotification() {
        achievementNotification.value = null
    }

    function getAchievementById(id) {
        return achievementDefinitions.find(a => a.id === id)
    }

    // Export function for JSON file persistence
    function exportData() {
        return {
            xp: xp.value,
            level: level.value,
            coins: coins.value,
            totalCoinsEarned: totalCoinsEarned.value,
            purchasedItems: purchasedItems.value,
            unlockedAchievements: unlockedAchievements.value,
            stats: stats.value,
            activeTheme: activeTheme.value,
            activeCosmetics: activeCosmetics.value
        }
    }

    function importData(data) {
        if (data.xp !== undefined) xp.value = data.xp
        if (data.level !== undefined) level.value = data.level
        if (data.coins !== undefined) coins.value = data.coins
        if (data.totalCoinsEarned !== undefined) totalCoinsEarned.value = data.totalCoinsEarned
        if (data.purchasedItems) purchasedItems.value = data.purchasedItems
        if (data.unlockedAchievements) unlockedAchievements.value = data.unlockedAchievements
        if (data.stats) stats.value = { ...stats.value, ...data.stats }

        // Restore active theme and cosmetics
        if (data.activeTheme) {
            activeTheme.value = data.activeTheme
            applyTheme(data.activeTheme)
        }
        if (data.activeCosmetics) {
            activeCosmetics.value = data.activeCosmetics
            // Apply cosmetic effects
            data.activeCosmetics.forEach(cosmeticId => {
                if (cosmeticId === 'golden_frame') {
                    document.documentElement.classList.add('cosmetic-golden-frame')
                }
            })
        }
    }

    return {
        // State
        xp,
        level,
        coins,
        totalCoinsEarned,
        purchasedItems,
        unlockedAchievements,
        stats,
        shopItems,
        levelUpNotification,
        achievementNotification,
        achievementDefinitions,
        ranks,

        // Computed
        currentRank,
        xpForNextLevel,
        xpProgress,
        xpToNextLevel,

        // Actions
        addXP,
        addFocusMinutes,
        purchaseItem,
        hasItem,
        activateItem,
        deactivateTheme,
        isItemActive,
        activeTheme,
        activeCosmetics,
        checkAchievements,
        dismissLevelUpNotification,
        dismissAchievementNotification,
        getAchievementById,
        exportData,
        importData,
        checkDailyReset
    }
})
