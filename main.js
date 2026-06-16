/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sirah School ERP - Electron Native Windows Entrypoint
 * Publisher: Bandr Solutions
 * Lead Architects: Bandr Qamlan & Rasheed Al-Mikhlafi
 * Location: Sana'a, Yemen
 */

// Use standard Node CommonJS requirements for Electron main process stability
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Sirah School ERP - مجمع المنارة لليمن",
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true, // Clean native aesthetic
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load production bundle (dist/index.html) or fallback to local port
  const hasDist = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
  if (hasDist) {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // Intercept window close to minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      // Notify once about minimizing to tray
      if (Notification.isSupported()) {
        new Notification({
          title: "نظام سيره المدرسي اللامركزي",
          body: "تم تصغير النظام إلى شريط المهام في الخلفية لضمان استمرارية الاتصال والمزامنة.",
          icon: path.join(__dirname, 'assets', 'icon.png')
        }).show();
      }
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single Instance lock to prevent administrative data corruption
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    
    // System Tray creation
    const trayIconPath = path.join(__dirname, 'assets', 'icon.png');
    if (fs.existsSync(trayIconPath)) {
      tray = new Tray(trayIconPath);
    } else {
      // Fallback
      tray = new Tray(path.join(__dirname, 'index.html')); // Fallback placeholder
    }
    
    const contextMenu = Menu.buildFromTemplate([
      { label: 'إظهار شاشة النظام الرئيسية', click: () => mainWindow.show() },
      { label: 'تشغيل وضع ملء الشاشة الكامل', click: () => { mainWindow.show(); mainWindow.setFullScreen(true); } },
      { type: 'separator' },
      { 
        label: 'إغلاق النظام نهائياً (تسجيل خروج)', 
        click: () => { 
          isQuitting = true; 
          app.quit(); 
        } 
      }
    ]);
    
    tray.setToolTip('Sirah School ERP - مجمع المنارة باليمن');
    tray.setContextMenu(contextMenu);
    
    // Native notification on boot
    if (Notification.isSupported()) {
      new Notification({
        title: "تم تشغيل سيره المدرسي بنجاح",
        body: "النظام يعمل بالكامل أوفلاين مع تخزين SQLite الداخلي المؤجج وقدرة المزامنة بالشبكة المحلية.",
        icon: path.join(__dirname, 'assets', 'icon.png')
      }).show();
    }
  });
}

// --- IPC Communication Handlers for Preload Bridge ---

// 1. Emit System Notifications
ipcMain.on('emit-sys-notification', (event, arg) => {
  if (Notification.isSupported()) {
    new Notification({
      title: arg.title || "تنبيه نظام سيره",
      body: arg.text || "تمت العملية بنجاح",
      icon: path.join(__dirname, 'assets', 'icon.png')
    }).show();
  }
});

// 2. Direct File System Save
ipcMain.handle('save-file-dialog', async (event, { content, defaultFilename, encoding = 'utf-8' }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'حفظ مستند مدرسي مباشر من نظام سيره',
    defaultPath: path.join(app.getPath('downloads'), defaultFilename),
    buttonLabel: 'حفظ مباشر',
    filters: [
      { name: 'JSON Backups', extensions: ['json'] },
      { name: 'SQL Scripts', extensions: ['sql'] },
      { name: 'CSV Reports', extensions: ['csv'] },
      { name: 'Text Documents', extensions: ['txt'] }
    ]
  });

  if (filePath) {
    try {
      fs.writeFileSync(filePath, content, encoding);
      return { success: true, filePath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, cancelled: true };
});

// 3. Direct File System Open / Load File
ipcMain.handle('open-file-dialog', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'استيراد نسخة احتياطية أو ملف كشوفات',
    properties: ['openFile'],
    filters: [
      { name: 'المتكامل (JSON/SQL/CSV)', extensions: ['json', 'sql', 'csv'] }
    ]
  });

  if (!canceled && filePaths.length > 0) {
    try {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, content, filePath: filePaths[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  return { success: false, cancelled: true };
});

// 4. Native Printing Command
ipcMain.handle('print-document', async (event, options) => {
  if (mainWindow) {
    // Elegant native silent or previewed silent prints
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      deviceName: options?.deviceName || '',
      color: true,
      margins: { marginType: 'default' },
      landscape: options?.landscape || false,
      pagesPerSheet: 1,
      collate: true,
      copies: 1
    }, (success, failureReason) => {
      if (!success) {
        console.error('Failed to print natively:', failureReason);
      }
    });
    return { success: true };
  }
  return { success: false, error: 'No active main window' };
});

// 5. Query Local System Information
ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    userDataPath: app.getPath('userData'),
    isPackaged: app.isPackaged
  };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
