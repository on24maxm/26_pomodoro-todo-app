// Sound System Composable
// Uses Web Audio API to generate sounds without external files

import { ref, computed } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore'

// Audio context singleton
let audioContext = null

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContext
}

// Sound definitions for default pack
const defaultSounds = {
    todoComplete: { frequency: 800, duration: 0.15, type: 'sine', ramp: true },
    pomodoroStart: { frequency: 440, duration: 0.3, type: 'sine', ramp: false },
    pomodoroEnd: { frequency: 600, duration: 0.5, type: 'sine', ramp: true, pattern: [1, 0.5, 1] },
    levelUp: { frequency: 523.25, duration: 0.8, type: 'sine', arpeggio: [523.25, 659.25, 783.99, 1046.50] },
    achievement: { frequency: 880, duration: 0.4, type: 'triangle', ramp: true, pattern: [1, 1] },
    purchase: { frequency: 700, duration: 0.2, type: 'sine', ramp: true },
    coinCollect: { frequency: 1200, duration: 0.1, type: 'sine', ramp: true },
    error: { frequency: 200, duration: 0.3, type: 'sawtooth', ramp: false },
    click: { frequency: 1000, duration: 0.05, type: 'sine', ramp: true },
    countdown: { frequency: 880, duration: 0.1, type: 'sine', ramp: true }
}

// Alternative sound pack (more melodic/game-like)
const altSounds = {
    todoComplete: { frequency: 1046.50, duration: 0.2, type: 'triangle', ramp: true, pattern: [1, 1.25] },
    pomodoroStart: { frequency: 330, duration: 0.4, type: 'triangle', arpeggio: [330, 392, 494] },
    pomodoroEnd: { frequency: 494, duration: 0.6, type: 'triangle', arpeggio: [494, 587, 698, 880] },
    levelUp: { frequency: 440, duration: 1.0, type: 'triangle', arpeggio: [440, 554, 659, 880, 1046, 1318] },
    achievement: { frequency: 698, duration: 0.5, type: 'triangle', arpeggio: [698, 880, 1046] },
    purchase: { frequency: 880, duration: 0.25, type: 'triangle', pattern: [1, 1.2, 1.5] },
    coinCollect: { frequency: 1568, duration: 0.12, type: 'triangle', pattern: [1, 1.5] },
    error: { frequency: 150, duration: 0.4, type: 'square', ramp: false, pattern: [1, 0.8] },
    click: { frequency: 1200, duration: 0.03, type: 'triangle', ramp: true },
    countdown: { frequency: 987.77, duration: 0.12, type: 'triangle', ramp: true }
}

function playTone(soundDef, volume = 0.3) {
    try {
        const ctx = getAudioContext()

        // Resume if suspended
        if (ctx.state === 'suspended') {
            ctx.resume()
        }

        const gainNode = ctx.createGain()
        gainNode.connect(ctx.destination)
        gainNode.gain.value = volume

        if (soundDef.arpeggio) {
            // Play arpeggio
            const noteDuration = soundDef.duration / soundDef.arpeggio.length
            soundDef.arpeggio.forEach((freq, index) => {
                const osc = ctx.createOscillator()
                const noteGain = ctx.createGain()

                osc.type = soundDef.type
                osc.frequency.value = freq

                osc.connect(noteGain)
                noteGain.connect(ctx.destination)

                const startTime = ctx.currentTime + (index * noteDuration)
                noteGain.gain.setValueAtTime(volume, startTime)
                noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9)

                osc.start(startTime)
                osc.stop(startTime + noteDuration)
            })
        } else if (soundDef.pattern) {
            // Play pattern (multiple notes)
            const noteDuration = soundDef.duration / soundDef.pattern.length
            soundDef.pattern.forEach((multiplier, index) => {
                const osc = ctx.createOscillator()
                const noteGain = ctx.createGain()

                osc.type = soundDef.type
                osc.frequency.value = soundDef.frequency * multiplier

                osc.connect(noteGain)
                noteGain.connect(ctx.destination)

                const startTime = ctx.currentTime + (index * noteDuration)
                noteGain.gain.setValueAtTime(volume, startTime)
                if (soundDef.ramp) {
                    noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9)
                }

                osc.start(startTime)
                osc.stop(startTime + noteDuration)
            })
        } else {
            // Single tone
            const osc = ctx.createOscillator()
            osc.type = soundDef.type
            osc.frequency.value = soundDef.frequency
            osc.connect(gainNode)

            if (soundDef.ramp) {
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + soundDef.duration)
            }

            osc.start()
            osc.stop(ctx.currentTime + soundDef.duration)
        }
    } catch (e) {
        console.warn('Sound playback failed:', e)
    }
}

export function useSounds() {
    const gamification = useGamificationStore()

    const soundEnabled = ref(true)
    const volume = ref(0.3)

    // Check if alternative sound pack is active
    const currentPack = computed(() => {
        return gamification.activeCosmetics.includes('sound_pack') ? altSounds : defaultSounds
    })

    function play(soundName) {
        if (!soundEnabled.value) return

        const soundDef = currentPack.value[soundName]
        if (soundDef) {
            playTone(soundDef, volume.value)
        }
    }

    // Convenience methods
    const playTodoComplete = () => play('todoComplete')
    const playPomodoroStart = () => play('pomodoroStart')
    const playPomodoroEnd = () => play('pomodoroEnd')
    const playLevelUp = () => play('levelUp')
    const playAchievement = () => play('achievement')
    const playPurchase = () => play('purchase')
    const playCoinCollect = () => play('coinCollect')
    const playError = () => play('error')
    const playClick = () => play('click')
    const playCountdown = () => play('countdown')

    return {
        soundEnabled,
        volume,
        play,
        playTodoComplete,
        playPomodoroStart,
        playPomodoroEnd,
        playLevelUp,
        playAchievement,
        playPurchase,
        playCoinCollect,
        playError,
        playClick,
        playCountdown
    }
}
