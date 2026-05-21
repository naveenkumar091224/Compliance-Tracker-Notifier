const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');

// Fix ICU data loading issues
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';

// Backend server configuration (expects Docker backend running)
const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../frontend/public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    title: 'Compliance Tracker'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, __dirname points to electron folder in ASAR
    // Need to go up one level to access frontend
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
    // Open DevTools to debug issues
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window events
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
}

function checkBackendHealth() {
  return new Promise((resolve, reject) => {
    console.log('Checking backend health at', BACKEND_URL);
    
    const req = http.get(`${BACKEND_URL}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log('Backend is healthy');
        resolve();
      } else {
        reject(new Error(`Backend returned status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      console.error('Backend health check failed:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Backend health check timeout'));
    });
  });
}

async function waitForBackend(maxRetries = 10, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await checkBackendHealth();
      return true;
    } catch (error) {
      console.log(`Backend not ready (attempt ${i + 1}/${maxRetries}), retrying...`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

// IPC Handlers
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xlsm', 'xls'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    const backendReady = await waitForBackend();
    
    if (!backendReady) {
      const result = dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Backend Not Available',
        message: 'Cannot connect to backend server at http://localhost:8000',
        detail: 'Please ensure the Docker backend is running:\n\n1. Open a terminal\n2. Navigate to the Compliance-Tracker-Notifier folder\n3. Run: docker-compose up -d\n\nOr use the START_DESKTOP_APP.bat file to start everything automatically.',
        buttons: ['Retry', 'Exit'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (result === 0) {
        // Retry
        app.relaunch();
        app.quit();
      } else {
        app.quit();
      }
      return;
    }
    
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Startup Error', 'An unexpected error occurred while starting the application.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Made with Bob
