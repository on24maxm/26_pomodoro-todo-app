<script setup>
import { useTodoStore } from '../stores/todoStore'

const emit = defineEmits(['connected', 'skip'])
const store = useTodoStore()

const connectExisting = async () => {
    await store.loadFromFile()
    if (store.isFileConnected()) {
        emit('connected')
    }
}

const createNew = async () => {
    await store.selectSaveFile()
    if (store.isFileConnected()) {
        emit('connected')
    }
}

const skipForNow = () => {
    emit('skip')
}
</script>

<template>
    <div class="connection-overlay">
        <div class="connection-dialog card">
            <div class="dialog-header">
                <span class="dialog-icon">📂</span>
                <h2>Datenspeicherung</h2>
            </div>
            
            <p class="dialog-description">
                Möchtest du deine Daten mit einer JSON-Datei synchronisieren?
                So bleiben deine Fortschritte beim Schließen der App erhalten.
            </p>

            <div class="dialog-options">
                <button @click="connectExisting" class="option-btn primary">
                    <span class="btn-icon">📁</span>
                    <div class="btn-content">
                        <span class="btn-title">Vorhandene Datei öffnen</span>
                        <span class="btn-subtitle">Bereits gespeicherte Daten laden</span>
                    </div>
                </button>

                <button @click="createNew" class="option-btn secondary">
                    <span class="btn-icon">✨</span>
                    <div class="btn-content">
                        <span class="btn-title">Neue Datei erstellen</span>
                        <span class="btn-subtitle">Speicherort für Daten wählen</span>
                    </div>
                </button>
            </div>

            <button @click="skipForNow" class="skip-btn">
                Später konfigurieren
            </button>
        </div>
    </div>
</template>

<style scoped>
.connection-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.connection-dialog {
    width: 90%;
    max-width: 420px;
    padding: var(--spacing-xl);
    text-align: center;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    background-color: var(--color-surface);
}

@keyframes slideUp {
    from { 
        transform: translateY(30px) scale(0.95); 
        opacity: 0; 
    }
    to { 
        transform: translateY(0) scale(1); 
        opacity: 1; 
    }
}

.dialog-header {
    margin-bottom: var(--spacing-md);
}

.dialog-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: var(--spacing-sm);
}

.dialog-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text);
}

.dialog-description {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: var(--spacing-lg);
}

.dialog-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.option-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.option-btn.primary {
    background: var(--color-accent);
    color: white;
}

.option-btn.primary:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
}

.option-btn.secondary {
    background: var(--color-bg);
    color: var(--color-text);
    border-color: var(--color-border);
}

.option-btn.secondary:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
}

.btn-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.btn-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.btn-title {
    font-weight: 600;
    font-size: 1rem;
}

.btn-subtitle {
    font-size: 0.8rem;
    opacity: 0.8;
}

.skip-btn {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    cursor: pointer;
    padding: var(--spacing-sm);
}

.skip-btn:hover {
    color: var(--color-text);
    text-decoration: underline;
}
</style>
