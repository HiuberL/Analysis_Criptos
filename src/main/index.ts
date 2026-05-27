import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// --- 1. FORZAR ESCALADO (Antes de que la app esté lista) ---
// Esto ignora el "125%" o "150%" de Windows y usa píxeles reales (1:1)
app.commandLine.appendSwitch('high-dpi-support', '1')
app.commandLine.appendSwitch('force-device-scale-factor', '1')

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    // He aumentado un poco el tamaño base para que quepa mejor tu tabla de Binance
    width: 1200, 
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'win32' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false,
      // --- 2. DESACTIVAR ZOOM ACCIDENTAL ---
      zoomFactor: 1.0 
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.setZoomLevel(-0.5) 
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})