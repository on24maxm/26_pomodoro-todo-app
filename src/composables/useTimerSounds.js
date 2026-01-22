/**
 * Composable for timer sound effects using Web Audio API
 */
export function useTimerSounds() {
    let audioContext = null

    // Initialize audio context lazily (must be triggered by user interaction)
    const getAudioContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        return audioContext
    }

    /**
     * Play a beep sound with specified frequency and duration
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {number} volume - Volume (0-1)
     * @param {string} type - Oscillator type: 'sine', 'square', 'sawtooth', 'triangle'
     */
    const playTone = (frequency = 440, duration = 0.15, volume = 0.3, type = 'sine') => {
        try {
            const ctx = getAudioContext()

            // Resume context if suspended (browser policy)
            if (ctx.state === 'suspended') {
                ctx.resume()
            }

            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.type = type
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, ctx.currentTime)
            gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + duration)
        } catch (error) {
            console.warn('Could not play sound:', error)
        }
    }

    /**
     * Sound when timer starts
     */
    const playStartSound = () => {
        // Ascending tone - motivating
        playTone(523, 0.1, 0.25, 'sine') // C5
        setTimeout(() => playTone(659, 0.1, 0.25, 'sine'), 100) // E5
        setTimeout(() => playTone(784, 0.15, 0.3, 'sine'), 200) // G5
    }

    /**
     * Sound for countdown (last 5 seconds) - single tick
     */
    const playTickSound = () => {
        playTone(800, 0.08, 0.2, 'sine')
    }

    /**
     * Sound when timer completes
     */
    const playCompleteSound = () => {
        // Triple ascending chime
        playTone(523, 0.2, 0.35, 'sine') // C5
        setTimeout(() => playTone(659, 0.2, 0.35, 'sine'), 150) // E5
        setTimeout(() => playTone(784, 0.2, 0.35, 'sine'), 300) // G5
        setTimeout(() => playTone(1047, 0.4, 0.4, 'sine'), 450) // C6
    }

    return {
        playStartSound,
        playTickSound,
        playCompleteSound
    }
}
