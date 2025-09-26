import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'pos.db');
export const db = new Database(dbPath);

function dropTables() {
  db.exec(`DROP TABLE IF EXISTS worker_performance_service;
DROP TABLE IF EXISTS worker_performance_weekly;
DROP TABLE IF EXISTS worker_performance_monthly;
DROP TABLE IF EXISTS worker_performance;
DROP TABLE IF EXISTS pending_transaction_items;
DROP TABLE IF EXISTS pending_transactions;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS workers;
`);
}

function createServices(){
    const insertService = db.prepare(`INSERT INTO services (name, duration, price, category) VALUES (@name, @duration, @price, @category)`);
    const services = [
        { name: 'Full Body Reflexology', duration: 60, price: 80, category: 'Reflexology' },
        { name: 'Foot Reflexology', duration: 30, price: 45, category: 'Reflexology' },
        { name: 'Hand Reflexology', duration: 30, price: 40, category: 'Reflexology' },
        { name: 'Head & Shoulder Massage', duration: 30, price: 50, category: 'Massage' },
        { name: 'Aromatherapy Massage', duration: 60, price: 90, category: 'Massage' },
        { name: 'Hot Stone Therapy', duration: 45, price: 65, category: 'Massage' },
        { name: 'Swedish Massage', duration: 60, price: 85, category: 'Massage' },
        { name: 'Deep Tissue Massage', duration: 60, price: 95, category: 'Massage' },
        { name: 'Couples Massage', duration: 60, price: 150, category: 'Massage' },
        { name: 'Facial Treatment', duration: 45, price: 70, category: 'Facial' },
        { name: 'Anti-Aging Facial', duration: 60, price: 100, category: 'Facial' },
        { name: 'Acne Treatment Facial', duration: 60, price: 90, category: 'Facial' },
        { name: 'Microdermabrasion', duration: 45, price: 110, category: 'Facial' },
        { name: 'Body Scrub', duration: 30, price: 55, category: 'Body Treatment' },
        { name: 'Body Wrap', duration: 60, price: 120, category: 'Body Treatment' },
    ];
    const insertMany = db.transaction((services) => {
        for (const service of services) insertService.run(service);
    });
    insertMany(services);
}

dropTables(); //only use when you want to reset the db

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
    paymentMethod TEXT NOT NULL DEFAULT 'cash',
    status TEXT NOT NULL DEFAULT 'paid'
        CHECK (status IN ('paid', 'refunded', 'voided', 'pending')),
    FOREIGN KEY (clientId) REFERENCES members(id)
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,          -- assigned by you
    transactionId TEXT NOT NULL,  -- FK → transactions.id
    serviceId INTEGER,            -- FK → services.id
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

createServices();

export default db;
