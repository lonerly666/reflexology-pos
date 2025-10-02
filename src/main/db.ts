import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'pos.db');
export const db = new Database(dbPath);

function dropTables() {
  db.exec(`
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS workers;
`);
}



// dropTables(); //only use when you want to reset the db
// db.prepare(`DROP TABLE IF EXISTS members;`).run();
db.exec(
  `
    -- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, 
    clientId INTEGER,            
    clientName String,
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
    paymentMethod TEXT NOT NULL DEFAULT 'cash',
    status TEXT NOT NULL DEFAULT 'paid'
        CHECK (status IN ('paid', 'refunded', 'voided', 'pending')),
    FOREIGN KEY (clientId) REFERENCES members(id)
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transactionId TEXT NOT NULL,  -- FK 
    serviceId INTEGER,            -- FK
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (serviceId) REFERENCES services(id)
);


CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT, 
    phone TEXT NOT NULL,
    joinDate DATETIME NOT NULL,     
    totalSpent REAL NOT NULL DEFAULT 0,
    points REAL NOT NULL DEFAULT 0,
    lastVisit DATETIME
);



CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    commission REAL NOT NULL,  
    joinDate DATETIME NOT NULL
);`
);

export default db;
