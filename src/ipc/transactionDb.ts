import { ipcMain } from 'electron';
import db from '../main/db';

export function transactionHandlers() {
  ipcMain.handle('db:newTransaction', (event, data) => {
    const updateMember = db.prepare(
      `UPDATE members SET points = points - @pointsUsed, lastVisit = @lastVisit, totalSpent = totalSpent + @newSpend WHERE id = @id`,
    );
    const insertTransaction = db.prepare(`INSERT INTO transactions (
            id, clientId, clientName, subtotal, discountPercent, discountAmount, tax, tipAmount, total,
            workerId, workerName, workerCommission, workerCommissionAmount, cashierName, date, companyTake, status, paymentMethod
        ) VALUES (
            @id, @clientId, @clientName, @subtotal, @discountPercent, @discountAmount, @tax, @tipAmount, @total,
            @workerId, @workerName, @workerCommission, @workerCommissionAmount, @cashierName, @date, @companyTake, @status, @paymentMethod
        )`);
    const insertItem = db.prepare(`INSERT INTO transaction_items (
           transactionId, serviceId, name, price, quantity, duration
        ) VALUES (
            @transactionId, @serviceId, @name, @price, @quantity, @duration
        )`);

    const updateWorkerPerformance = db.prepare(
      `UPDATE workers SET totalEarnings = totalEarnings + @newEarning, totalTransactions = totalTransactions + 1 WHERE id = @workerId`,
    );

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
    const updateMemberInfo = db.transaction((info) => {
      return updateMember.run(info);
    });
    try {
      transaction(data);
      const workerPerformanceData = {
        workerId: data.workerId,
        newEarning: data.workerCommissionAmount,
      };
      console.log(workerPerformanceData);
      updateWorkerPerformance.run(workerPerformanceData);
      if (data.clientId !== null) {
        const pointsPayment = data.paymentMethods.find((t: any) => {
          return t.type === 'points';
        });
        const pointsUsedAmount = pointsPayment ? pointsPayment.amount : 0;
        const toDate = new Date().toISOString();
        updateMemberInfo({
          id: data.clientId,
          pointsUsed: pointsUsedAmount,
          lastVisit: toDate,
          newSpend: data.total,
        });
      }
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

  ipcMain.handle('db:updateTransactionStatus', (event, data) => {
    const stmt = db.prepare(`UPDATE transactions SET status = ? WHERE id = ?`);
    try {
      const info = stmt.run(data.status, data.id);
      return { success: 'true', ...info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:updateTransactions', (event, data) => {
    if (data.clientId === null || data.clientId === undefined) {
      data.clientId = null;
    }

    const updateMember = db.prepare(
      `UPDATE members SET points = points - @pointsUsed, lastVisit = @lastVisit, totalSpent = @newSpend WHERE id = @id`,
    );
    const updateTransaction = db.prepare(`UPDATE transactions SET
            clientId = @clientId,
            clientName = @clientName,
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
          serviceId: item.serviceId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          duration: item.duration,
        });
      }
    });
    const updateWorkerPerformance = db.prepare(
      `UPDATE workers SET totalEarnings = totalEarnings + @newEarning, totalTransactions = totalTransactions + 1, workDuration = workDuration + @newDuration WHERE workerId = @workerId`,
    );

    const updateMemberInfo = db.transaction((info) => {
      return updateMember.run(info);
    });
    try {
      transaction(data);
      if (data.status === 'paid') {
        const pointsPayment = data.paymentMethods.find((t: any) => {
          return t.type === 'points';
        });
        const pointsUsedAmount = pointsPayment ? pointsPayment.amount : 0;
        const toDate = new Date().toISOString();
        updateMemberInfo({
          id: data.clientId,
          pointsUsed: pointsUsedAmount,
          lastVisit: toDate,
          newSpend: data.total,
        });
        const workerPerformanceData = {
          workerId: data.workerId,
          newEarning: data.workerCommissionAmount,
          newDuration: data.workDuration,
        };
        updateWorkerPerformance.run(workerPerformanceData);
      }
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

  ipcMain.handle('db:getWorkerTransactions', (event, data) => {
    const stmt = db.prepare(`
            SELECT workerCommissionAmount, workerId FROM transactions WHERE date BETWEEN ? AND ? WHERE workerId = ?
        `);

    const getItemsStmt = db.prepare(
      `SELECT * FROM transaction_items WHERE transactionId = ?`,
    );
    try {
      const transactions = stmt.all(
        data.start,
        data.end,
        data.workerId,
      ) as any[];
      for (const transaction of transactions) {
        transaction.items = getItemsStmt.all(transaction.id);
      }
      return { success: 'true', transactions };
    } catch (err) {
      return { success: 'false', err };
    }
  });
}
