const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    // In production, load the local index.html
    // In development, wait for vite server and load that
    const isDev = !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5190')
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

// IPC Handlers for file operations

// Open file dialog and return selected path
ipcMain.handle('select-json-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, path: null }
    }

    return { success: true, path: result.filePaths[0] }
})

// Save file dialog and return selected path
ipcMain.handle('select-save-file', async () => {
    const result = await dialog.showSaveDialog({
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        defaultPath: 'pomodoro-data.json'
    })

    if (result.canceled || !result.filePath) {
        return { success: false, path: null }
    }

    return { success: true, path: result.filePath }
})

// Read file contents
ipcMain.handle('read-json-file', async (event, filePath) => {
    try {
        const contents = fs.readFileSync(filePath, 'utf-8')
        return { success: true, data: JSON.parse(contents) }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

// Write file contents
ipcMain.handle('write-json-file', async (event, filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
    return fs.existsSync(filePath)
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
