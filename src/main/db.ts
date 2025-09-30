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
DROP TABLE IF EXISTS workers;
`);
}

function createServices() {
  const insertService = db.prepare(
    `INSERT INTO services (name, duration, price, category) VALUES (@name, @duration, @price, @category)`,
  );
  const services = [
    {
      name: 'Full Body Reflexology',
      duration: 60,
      price: 80,
      category: 'Reflexology',
    },
    {
      name: 'Foot Reflexology',
      duration: 30,
      price: 45,
      category: 'Reflexology',
    },
    {
      name: 'Hand Reflexology',
      duration: 30,
      price: 40,
      category: 'Reflexology',
    },
    {
      name: 'Head & Shoulder Massage',
      duration: 30,
      price: 50,
      category: 'Massage',
    },
    {
      name: 'Aromatherapy Massage',
      duration: 60,
      price: 90,
      category: 'Massage',
    },
    { name: 'Hot Stone Therapy', duration: 45, price: 65, category: 'Massage' },
    { name: 'Swedish Massage', duration: 60, price: 85, category: 'Massage' },
    {
      name: 'Deep Tissue Massage',
      duration: 60,
      price: 95,
      category: 'Massage',
    },
    { name: 'Couples Massage', duration: 60, price: 150, category: 'Massage' },
    { name: 'Facial Treatment', duration: 45, price: 70, category: 'Facial' },
    { name: 'Anti-Aging Facial', duration: 60, price: 100, category: 'Facial' },
    {
      name: 'Acne Treatment Facial',
      duration: 60,
      price: 90,
      category: 'Facial',
    },
    { name: 'Microdermabrasion', duration: 45, price: 110, category: 'Facial' },
    { name: 'Body Scrub', duration: 30, price: 55, category: 'Body Treatment' },
    { name: 'Body Wrap', duration: 60, price: 120, category: 'Body Treatment' },
  ];
  const insertMany = db.transaction((services) => {
    for (const service of services) insertService.run(service);
  });
  insertMany(services);
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
    joinDate DATETIME NOT NULL,
    totalEarnings REAL NOT NULL DEFAULT 0,
    totalTransactions INTEGER NOT NULL DEFAULT 0,
    workDuration REAL NOT NULL DEFAULT 0
);`,
);

export default db;
