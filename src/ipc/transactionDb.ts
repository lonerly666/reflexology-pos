import { ipcMain } from 'electron';
import db from '../main/db';

export function transactionHandlers() {
  ipcMain.handle('db:newTransaction', (event, data) => {
    const insertTransaction = db.prepare(`INSERT INTO transactions (
            id, clientId, subtotal, discountPercent, discountAmount, tax, tipAmount, total,
            workerId, workerName, workerCommission, workerCommissionAmount, cashierName, date, companyTake, status, paymentMethod
        ) VALUES (
            @id, @clientId, @subtotal, @discountPercent, @discountAmount, @tax, @tipAmount, @total,
            @workerId, @workerName, @workerCommission, @workerCommissionAmount, @cashierName, @date, @companyTake, @status, @paymentMethod
        )`);
    const insertItem = db.prepare(`INSERT INTO transaction_items (
           transactionId, serviceId, name, price, quantity, duration
        ) VALUES (
            @transactionId, @serviceId, @name, @price, @quantity, @duration
        )`);

    const transaction = db.transaction((transactionData) => {
      insertTransaction.run(transactionData);
      for (const item of transactionData.items) {
        insertItem.run({
          transactionId: transactionData.id,
          serviceId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          duration: item.duration,
        });
      }
    });
    try {
      transaction(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to insert transaction:', error);
      return { success: false, error };
    }
  });

  ipcMain.handle('db:getTransactions', (event, { startDate, endDate }) => {
    console.log('Fetching transactions from', startDate, 'to', endDate);
    const stmt = db.prepare(`
            SELECT * FROM transactions 
            WHERE date BETWEEN ? AND ? 
            ORDER BY date DESC
        `);
    const transactions = stmt.all(startDate, endDate) as any[];
    const getItemsStmt = db.prepare(
      `SELECT * FROM transaction_items WHERE transactionId = ?`,
    );
    for (const transaction of transactions) {
      transaction.items = getItemsStmt.all(transaction.id);
    }
    return transactions;
  });

  ipcMain.handle('db:getTransactionById', (event, id) => {
    const stmt = db.prepare(`SELECT * FROM transactions WHERE id = ?`);
    const transaction = stmt.get(id) as any;
    if (transaction) {
      const getItemsStmt = db.prepare(
        `SELECT * FROM transaction_items WHERE transactionId = ?`,
      );
      transaction.items = getItemsStmt.all(transaction.id);
    }
    return transaction;
  });

  ipcMain.handle('db:updateStatus', (event, data) => {
    const stmt = db.prepare(`UPDATE transactions SET status = ? WHERE id = ?`);
    const info = stmt.run(data.status, data.id);
    return { changes: info.changes };
  });

  ipcMain.handle('db:updateTransactions', (event, data) => {
    const updateTransaction = db.prepare(`UPDATE transactions SET
            clientId = @clientId,
            subtotal = @subtotal,
            discountPercent = @discountPercent,
            discountAmount = @discountAmount,
            tax = @tax,
            tipAmount = @tipAmount,
            total = @total,
            workerId = @workerId,
            workerName = @workerName,
            workerCommission = @workerCommission,
            workerCommissionAmount = @workerCommissionAmount,
            cashierName = @cashierName,
            date = @date,
            companyTake = @companyTake,
            status = @status,
            paymentMethod = @paymentMethod
        WHERE id = @id`);
    const deleteItems = db.prepare(
      `DELETE FROM transaction_items WHERE transactionId = ?`,
    );
    const insertItem = db.prepare(`INSERT INTO transaction_items (
           transactionId, serviceId, name, price, quantity, duration
        ) VALUES (
            @transactionId, @serviceId, @name, @price, @quantity, @duration
        )`);
    const transaction = db.transaction((transactionData) => {
      updateTransaction.run(transactionData);
      deleteItems.run(transactionData.id);
      for (const item of transactionData.items) {
        insertItem.run({
          transactionId: transactionData.id,
          serviceId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          duration: item.duration,
        });
      }
    });
    try {
      transaction(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      return { success: false, error };
    }
  });

  ipcMain.handle('db:getPendingTransactions', () => {
    const stmt = db.prepare(`
            SELECT * FROM transactions WHERE status = 'pending'
            ORDER BY date DESC
        `);
    const transactions = stmt.all() as any[];
    const getItemsStmt = db.prepare(
      `SELECT * FROM transaction_items WHERE transactionId = ?`,
    );
    for (const transaction of transactions) {
      transaction.items = getItemsStmt.all(transaction.id);
    }
    return transactions;
  });

  ipcMain.handle('db:deletePendingTransaction', (event, id) => {
    const deleteItemsStmt = db.prepare(
      `DELETE FROM transaction_items WHERE transactionId = ?`,
    );
    deleteItemsStmt.run(id);
    const deleteTransactionStmt = db.prepare(
      `DELETE FROM transactions WHERE id = ?`,
    );
    const info = deleteTransactionStmt.run(id);
    return { changes: info.changes };
  });
}
