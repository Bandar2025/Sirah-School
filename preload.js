/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sirah School ERP - Preload Bridge Script
 * Publisher: Bandr Solutions
 * Location: Sana'a, Yemen
 */

const { contextBridge, ipcRenderer } = require('electron');

// Safeguard expose methods to render window sandbox context safely
contextBridge.exposeInMainWorld('electronAPI', {
  // Emit notifications
  sendNotification: (arg) => ipcRenderer.send('emit-sys-notification', arg),
  
  // Save file dialog and direct storage dump
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  
  // Open file dialog and direct import retrieval
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // Native printing bridge
  printDocument: (options) => ipcRenderer.invoke('print-document', options),
  
  // Retrieve static system telemetry info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
