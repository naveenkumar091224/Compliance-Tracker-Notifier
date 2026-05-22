# Compliance Tracker Desktop Application Guide

## Overview

This guide outlines the process of converting the Compliance Tracker web application into a standalone Windows desktop application (.exe) with system tray integration, native notifications, and auto-start capabilities.

## Architecture Options

### Option 1: Electron (Recommended)
**Pros:**
- Mature ecosystem with extensive documentation
- Large community support
- Rich plugin ecosystem (electron-builder, electron-updater)
- Better compatibility with existing React/Vite setup
- Easier to bundle Python backend with electron-builder

**Cons:**
- Larger bundle size (~150-200 MB)
- Higher memory usage
- Chromium-based (similar to web version)

**Best For:** Quick development, feature-rich applications, when bundle size is not critical

### Option 2: Tauri
**Pros:**
- Smaller bundle size (~10-20 MB)
- Lower memory footprint
- Uses system WebView (Edge WebView2 on Windows)
- Rust-based backend (more secure)
- Modern and actively developed

**Cons:**
- Smaller community
- Less mature ecosystem
- Requires Rust toolchain
- More complex Python backend integration

**Best For:** Performance-critical applications, when bundle size matters

## Recommended Approach: Electron

Given the current tech stack (React + FastAPI/Python), **Electron** is the recommended choice for faster development and better Python integration.

---

## Desktop Application Architecture

```
Compliance-Tracker-Desktop/
├── electron/                    # Electron main process
│   ├── main.js                 # Main entry point
│   ├── preload.js              # Preload script for security
│   ├── tray.js                 # System tray functionality
│   └── backend-manager.js      # Python backend process manager
├── frontend/                    # React frontend (existing)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # FastAPI backend (existing)
│   ├── server.py
│   ├── requirements.txt
│   └── build/                  # PyInstaller output
├── resources/                   # Desktop app resources
│   ├── icon.ico               # Windows icon
│   ├── icon.png               # PNG icon
│   └── tray-icon.png          # System tray icon
├── installer/                   # Installer configuration
│   └── installer.nsh          # NSIS installer script
├── package.json                # Root package.json
└── electron-builder.yml        # Electron builder config
```

---

## Implementation Plan

### Phase 1: Setup Electron Project Structure

#### 1.1 Install Electron Dependencies
```bash
cd Compliance-Tracker-Notifier
npm init -y  # If no root package.json exists
npm install --save-dev electron electron-builder electron-is-dev
npm install --save-dev concurrently wait-on cross-env
```

#### 1.2 Create Electron Main Process
**File: `electron/main.js`**
- Initialize Electron app
- Create main window
- Load React frontend
- Manage Python backend process
- Handle app lifecycle events

#### 1.3 Create Preload Script
**File: `electron/preload.js`**
- Expose safe IPC channels to renderer
- Bridge between frontend and Electron APIs

#### 1.4 Update Root package.json
```json
{
  "name": "compliance-tracker-desktop",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\" \"wait-on http://localhost:3001 && electron .\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && uvicorn server:app --reload --port 8000",
    "build": "npm run build:frontend && npm run build:backend && npm run build:electron",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && pyinstaller --onefile server.py",
    "build:electron": "electron-builder"
  }
}
```

---

### Phase 2: Bundle Python Backend

#### 2.1 Install PyInstaller
```bash
pip install pyinstaller
```

#### 2.2 Create PyInstaller Spec File
**File: `backend/server.spec`**
```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('data', 'data'),  # Include database directory
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='compliance-tracker-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='../resources/icon.ico'
)
```

#### 2.3 Build Backend Executable
```bash
cd backend
pyinstaller server.spec
```

---

### Phase 3: Electron Main Process Implementation

#### 3.1 Main Window Configuration
```javascript
// electron/main.js
const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../resources/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load frontend
  const startUrl = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, '../backend/server.py')
    : path.join(process.resourcesPath, 'backend', 'compliance-tracker-backend.exe');

  if (isDev) {
    // Development: Run Python directly
    backendProcess = spawn('python', [backendPath], {
      cwd: path.join(__dirname, '../backend')
    });
  } else {
    // Production: Run bundled executable
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath)
    });
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  startBackend();
  
  // Wait for backend to start
  setTimeout(() => {
    createWindow();
    createTray();
  }, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopBackend();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

#### 3.2 System Tray Implementation
```javascript
// electron/tray.js
const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

function createTray(mainWindow) {
  const iconPath = path.join(__dirname, '../resources/tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  const tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Hide App',
      click: () => {
        mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Compliance Tracker');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  
  return tray;
}

module.exports = { createTray };
```

#### 3.3 Preload Script
```javascript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Notification APIs
  showNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  
  // App control
  minimizeToTray: () => {
    ipcRenderer.send('minimize-to-tray');
  },
  
  quitApp: () => {
    ipcRenderer.send('quit-app');
  }
});
```

---

### Phase 4: Native Notifications

#### 4.1 Update Frontend Notification Service
**File: `frontend/src/services/notificationService.ts`**
```typescript
export const showDesktopNotification = (title: string, body: string) => {
  // Check if running in Electron
  if (window.electronAPI) {
    window.electronAPI.showNotification(title, body);
  } else {
    // Fallback to web notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
};
```

#### 4.2 Handle Notifications in Main Process
```javascript
// In electron/main.js
const { Notification } = require('electron');

ipcMain.on('show-notification', (event, { title, body }) => {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, '../resources/icon.png')
  }).show();
});
```

---

### Phase 5: Auto-Start Configuration

#### 5.1 Windows Auto-Start
```javascript
// In electron/main.js
const AutoLaunch = require('auto-launch');

const autoLauncher = new AutoLaunch({
  name: 'Compliance Tracker',
  path: app.getPath('exe'),
});

// Enable auto-start
app.whenReady().then(() => {
  autoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      autoLauncher.enable();
    }
  });
});
```

Install dependency:
```bash
npm install --save auto-launch
```

---

### Phase 6: Electron Builder Configuration

#### 6.1 Create electron-builder.yml
```yaml
appId: com.companyname.compliancetracker
productName: Compliance Tracker
copyright: Copyright © 2024

directories:
  buildResources: resources
  output: dist-electron

files:
  - electron/**/*
  - frontend/dist/**/*
  - resources/**/*
  - package.json

extraResources:
  - from: backend/dist/compliance-tracker-backend.exe
    to: backend/compliance-tracker-backend.exe
  - from: backend/data
    to: backend/data

win:
  target:
    - nsis
    - portable
  icon: resources/icon.ico
  artifactName: ${productName}-Setup-${version}.${ext}

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: Compliance Tracker
  runAfterFinish: true
  installerIcon: resources/icon.ico
  uninstallerIcon: resources/icon.ico
  license: LICENSE

portable:
  artifactName: ${productName}-Portable-${version}.${ext}

publish:
  provider: generic
  url: https://your-update-server.com
```

---

### Phase 7: Build Process

#### 7.1 Complete Build Script
```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "clean": "rimraf dist-electron frontend/dist backend/dist",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && pyinstaller server.spec",
    "build:electron": "electron-builder --win --x64",
    "build": "npm run build:frontend && npm run build:backend && npm run build:electron",
    "build:portable": "npm run build:frontend && npm run build:backend && electron-builder --win portable"
  }
}
```

#### 7.2 Build Commands
```bash
# Install all dependencies
npm install
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# Build everything
npm run build

# Output will be in dist-electron/
# - Compliance Tracker-Setup-1.0.0.exe (Installer)
# - Compliance Tracker-Portable-1.0.0.exe (Portable)
```

---

## Features Comparison: Web vs Desktop

| Feature | Web App | Desktop App |
|---------|---------|-------------|
| Installation | Browser only | Windows installer (.exe) |
| Notifications | Browser notifications | Native Windows notifications |
| System Tray | ❌ | ✅ System tray icon |
| Auto-Start | ❌ | ✅ Start with Windows |
| Offline Mode | ❌ Limited | ✅ Full offline support |
| Updates | Manual refresh | Auto-update capability |
| Performance | Browser-dependent | Optimized for desktop |
| Database | Shared/Server | Local SQLite per user |
| Port Conflicts | Possible | Managed internally |

---

## Desktop-Specific Features to Add

### 1. System Tray Menu
- Show/Hide window
- Quick access to recent tasks
- Notification settings
- Quit application

### 2. Native Notifications
- Windows Action Center integration
- Notification sounds
- Notification actions (Mark as complete, Snooze)

### 3. Auto-Update
```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  // Show update notification
});

autoUpdater.on('update-downloaded', () => {
  // Prompt user to restart
});
```

### 4. Keyboard Shortcuts
```javascript
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  // Show/Hide with Ctrl+Shift+C
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
});
```

### 5. Context Menu
```javascript
const { Menu } = require('electron');

const contextMenu = Menu.buildFromTemplate([
  { role: 'cut' },
  { role: 'copy' },
  { role: 'paste' },
  { type: 'separator' },
  { role: 'selectAll' }
]);

mainWindow.webContents.on('context-menu', (e, params) => {
  contextMenu.popup(mainWindow, params.x, params.y);
});
```

---

## Testing Checklist

- [ ] Application starts successfully
- [ ] Backend process starts automatically
- [ ] Frontend loads correctly
- [ ] Login/Authentication works
- [ ] Database operations work
- [ ] Native notifications appear
- [ ] System tray icon appears
- [ ] System tray menu works
- [ ] Minimize to tray works
- [ ] Auto-start on Windows boot works
- [ ] Application updates work
- [ ] Installer creates desktop shortcut
- [ ] Installer creates start menu entry
- [ ] Uninstaller removes all files
- [ ] Multiple instances prevention works
- [ ] Application closes cleanly

---

## Distribution

### Installer (.exe)
- Full installation with shortcuts
- Registry entries for auto-start
- Uninstaller included
- Size: ~150-200 MB

### Portable (.exe)
- No installation required
- Run from any location
- No registry changes
- Size: ~150-200 MB

---

## Next Steps

1. **Review this plan** and confirm the approach
2. **Set up Electron project structure**
3. **Bundle Python backend** with PyInstaller
4. **Integrate frontend build** with Electron
5. **Implement system tray** and native notifications
6. **Configure auto-start** functionality
7. **Build installer** with electron-builder
8. **Test thoroughly** on Windows 11
9. **Create user documentation**
10. **Deploy and distribute**

---

## Estimated Timeline

- **Phase 1-2**: Setup & Backend Bundling - 2-3 hours
- **Phase 3-4**: Electron Integration & Notifications - 3-4 hours
- **Phase 5-6**: Auto-Start & Builder Config - 2-3 hours
- **Phase 7**: Build & Testing - 2-3 hours
- **Total**: 9-13 hours

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Electron Builder](https://www.electron.build/)
- [PyInstaller Documentation](https://pyinstaller.org/)
- [Auto Launch](https://github.com/Teamwork/node-auto-launch)
- [Electron Updater](https://www.electron.build/auto-update)

---

**Ready to proceed?** Let me know if you'd like to start implementing this plan!