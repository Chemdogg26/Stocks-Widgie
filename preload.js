const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('set-settings', settings),
  setWindowOpacity: (opacity) => ipcRenderer.invoke('set-window-opacity', opacity),
  setClickThrough: (enabled) => ipcRenderer.invoke('set-click-through', enabled),

  // Stock data IPC
  fetchStockQuote: (symbol) => ipcRenderer.invoke('fetch-stock-quote', symbol),
  fetchStockHistory: (params) => ipcRenderer.invoke('fetch-stock-history', params)
});
