/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import Database from 'better-sqlite3';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
let db;
function initializeDatabase() {
  db = new Database(path.join(app.getPath('userData'), 'pos.db'));
  db.exec(
    `
    -- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,          -- assigned by you
    clientId INTEGER,             -- FK → members.id
    subtotal REAL NOT NULL,
    discountPercent REAL NOT NULL,
    discountAmount REAL NOT NULL,
    tax REAL NOT NULL,
    tipAmount REAL NOT NULL,
    total REAL NOT NULL,
    workerId TEXT,
    workerName TEXT,
    workerCommission REAL,
    workerCommissionAmount REAL,
    cashierName TEXT NOT NULL,
    date DATETIME NOT NULL,
    notes TEXT,
    companyTake REAL,
    FOREIGN KEY (clientId) REFERENCES members(id)
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id TEXT PRIMARY KEY,          -- assigned by you
    transactionId TEXT NOT NULL,  -- FK → transactions.id
    serviceId INTEGER,            -- FK → services.id
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id)
);

-- Pending Transactions
CREATE TABLE IF NOT EXISTS pending_transactions (
    id TEXT PRIMARY KEY,          -- assigned by you
    clientId INTEGER,             -- FK → members.id
    subtotal REAL NOT NULL,
    discountPercent REAL NOT NULL,
    discountAmount REAL NOT NULL,
    tax REAL NOT NULL,
    tipAmount REAL NOT NULL,
    total REAL NOT NULL,
    workerId TEXT,
    workerName TEXT,
    workerCommission REAL,
    workerCommissionAmount REAL,
    cashierName TEXT NOT NULL,
    date DATETIME NOT NULL,
    notes TEXT,
    companyTake REAL,
    FOREIGN KEY (clientId) REFERENCES members(id)
);

-- Pending Transaction Items
CREATE TABLE IF NOT EXISTS pending_transaction_items (
    id TEXT PRIMARY KEY,          -- assigned by you
    transactionId TEXT NOT NULL,  -- FK → pending_transactions.id
    serviceId INTEGER,            -- FK → services.id
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    FOREIGN KEY (transactionId) REFERENCES pending_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id)
);


CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,       -- can be NULL
    phone TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,   -- in minutes (or whatever unit you use)
    price REAL NOT NULL,
    category TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    commission REAL NOT NULL,   -- % or fixed amount depending on your logic
    status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'break'))
);


-- Worker performance summary
CREATE TABLE IF NOT EXISTS worker_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workerId INTEGER NOT NULL,   -- FK → workers.id
    totalEarnings REAL NOT NULL,
    totalTransactions INTEGER NOT NULL,
    averageTransaction REAL NOT NULL,
    hoursWorked REAL NOT NULL,
    rating REAL NOT NULL,
    FOREIGN KEY (workerId) REFERENCES workers(id)
);

-- Monthly earnings breakdown
CREATE TABLE IF NOT EXISTS worker_performance_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    month TEXT NOT NULL,             -- e.g. '2025-09'
    earnings REAL NOT NULL,
    transactions INTEGER NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE
);

-- Weekly earnings breakdown
CREATE TABLE IF NOT EXISTS worker_performance_weekly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    day TEXT NOT NULL,               -- e.g. 'Mon', '2025-09-25'
    earnings REAL NOT NULL,
    transactions INTEGER NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE
);

-- Service breakdown
CREATE TABLE IF NOT EXISTS worker_performance_service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    serviceId INTEGER,               -- FK → services.id (optional, for linking)
    service TEXT NOT NULL,           -- snapshot name
    count INTEGER NOT NULL,
    earnings REAL NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id)
);

-- Worker performance summary
CREATE TABLE IF NOT EXISTS worker_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workerId INTEGER NOT NULL,   -- FK → workers.id
    totalEarnings REAL NOT NULL,
    totalTransactions INTEGER NOT NULL,
    averageTransaction REAL NOT NULL,
    hoursWorked REAL NOT NULL,
    rating REAL NOT NULL,
    FOREIGN KEY (workerId) REFERENCES workers(id)
);

-- Monthly earnings breakdown
CREATE TABLE IF NOT EXISTS worker_performance_monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    month TEXT NOT NULL,             -- e.g. '2025-09'
    earnings REAL NOT NULL,
    transactions INTEGER NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE
);

-- Weekly earnings breakdown
CREATE TABLE IF NOT EXISTS worker_performance_weekly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    day TEXT NOT NULL,               -- e.g. 'Mon', '2025-09-25'
    earnings REAL NOT NULL,
    transactions INTEGER NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE
);

-- Service breakdown
CREATE TABLE IF NOT EXISTS worker_performance_service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    performanceId INTEGER NOT NULL,  -- FK → worker_performance.id
    serviceId INTEGER,               -- FK → services.id (optional, for linking)
    service TEXT NOT NULL,           -- snapshot name
    count INTEGER NOT NULL,
    earnings REAL NOT NULL,
    FOREIGN KEY (performanceId) REFERENCES worker_performance(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id)
);`,
  );

  console.log('Database initialized with tables.');
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    initializeDatabase();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
