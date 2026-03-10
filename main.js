import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Store from 'electron-store';
import fetch from 'node-fetch'; // HTTP client used only in the main process

const ALPHA_VANTAGE_API_KEY = 'SF2D81BAHC0P2YSE';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize electron-store for settings persistence
const store = new Store({
  defaults: {
    stocks: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
    rotationDuration: 30,
    windowOpacity: 0.95,
    clickThrough: false
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
      // webSecurity is TRUE by default – we keep it enabled for safety
    }
  });

  // Load the app
  const isDev = !app.isPackaged; // running via `electron .` -> dev, packaged -> prod

  if (isDev) {
    // Use Vite dev server in development
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Use built files in production
    mainWindow.loadFile(join(__dirname, 'dist', 'index.html'));
  }

  // Set window opacity
  mainWindow.setOpacity(store.get('windowOpacity'));

  // Handle click-through
  if (store.get('clickThrough')) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for settings
ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-settings', (event, settings) => {
  store.set(settings);
  return store.store;
});

ipcMain.handle('set-window-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
  }
});

ipcMain.handle('set-click-through', (event, enabled) => {
  if (mainWindow) {
    if (enabled) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
});

//
// IPC handlers for stock data (Yahoo Finance HTTP calls)
//

ipcMain.handle('fetch-stock-quote', async (event, symbolRaw) => {
  const symbol = symbolRaw?.trim()?.toUpperCase();
  if (!symbol) {
    throw new Error('Invalid symbol provided');
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
    symbol
  )}&apikey=${ALPHA_VANTAGE_API_KEY}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('Network error fetching quote', err);
    throw new Error('Network error: Unable to connect to stock data service');
  }

  if (!res.ok) {
    throw new Error(`Quote request failed: ${res.status}`);
  }

  const json = await res.json();
  return json;
});

ipcMain.handle('fetch-stock-history', async (event, { symbol: symbolRaw, range, interval }) => {
  const symbol = symbolRaw?.trim()?.toUpperCase();
  if (!symbol) {
    throw new Error('Invalid symbol provided');
  }

  // Use daily adjusted time series; we'll down-sample on the frontend for timeframes
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
    symbol
  )}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('Network error fetching historical data', err);
    throw new Error('Network error: Unable to connect to stock data service');
  }

  if (!res.ok) {
    throw new Error(`History request failed: ${res.status}`);
  }

  const json = await res.json();
  return json;
});
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
});
