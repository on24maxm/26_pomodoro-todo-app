const { contextBridge, ipcRenderer } = require('electron')

// Expose Electron APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // File dialogs
    selectJsonFile: () => ipcRenderer.invoke('select-json-file'),
    selectSaveFile: () => ipcRenderer.invoke('select-save-file'),

    // File operations
    readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath),
    writeJsonFile: (filePath, data) => ipcRenderer.invoke('write-json-file', filePath, data),
    fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),

    // Check if running in Electron
    isElectron: true
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})
