import { ipcMain } from 'electron';
import db from '../main/db';

export function workersHandler() {
  ipcMain.handle('db:addWorker', (event, data) => {
    const addWorker = db.prepare(
      `INSERT INTO workers (name, commission, joinDate) VALUES (@name, @commission, @joinDate)`,
    );

    try {
      const info = addWorker.run(data);
      console.log(info);
      return { success: 'true', info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:getWorkers', () => {
    const getWorkers = db.prepare(`SELECT * FROM workers`);
    try {
      const workerInfo = getWorkers.all();
      return { success: 'true', workerInfo };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:getWorkersByDate', (event, data) => {
    const query = db.prepare(`SELECT
    w.id,
    w.name,
    w.commission,
    w.joinDate,
    -- Metrics aggregated from the transactions table
    COALESCE(T.totalTransactions, 0) AS totalTransactions,
    COALESCE(T.totalGrossEarnings, 0.0) AS totalGrossEarnings,
    COALESCE(T.totalCommissionEarnings, 0.0) AS totalActualEarnings,
    COALESCE(T.totalWorkDuration, 0) AS totalWorkDuration
FROM
    workers w
LEFT JOIN
    (
        -- Subquery (T): Aggregates all metrics per worker ID based on the date range
        SELECT
            t.workerId,
            COUNT(t.id) AS totalTransactions,
            SUM(t.subtotal) AS totalGrossEarnings, -- Total revenue before commission
            SUM(t.workerCommissionAmount) AS totalCommissionEarnings, -- Total revenue after commission
            -- Aggregate duration from transaction_items for all items in these transactions
            SUM(ti.duration) AS totalWorkDuration
        FROM
            transactions t
        JOIN
            transaction_items ti ON t.id = ti.transactionId
        WHERE
            t.date BETWEEN @startDate AND @endDate -- 💡 Filter by date range
            AND t.status = 'paid'                   -- 💡 Ensure only successful transactions are counted
        GROUP BY
            t.workerId
    ) T ON w.id = T.workerId;`);

    try {
      const info = query.all(data);

      return { success: 'true', info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:updateWorker', (event, data) => {
    const updateWorker = db.prepare(
      `UPDATE workers SET name = @name, commission = @commission, joinDate = @joinDate WHERE id = @id`,
    );
    try {
      const info = updateWorker.run(data);
      return { success: 'true', info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:searchWorker', (event, data) => {
    const searchWorker = db.prepare(`SELECT * FROM workers 
   WHERE name LIKE ?`);
    try {
      const info = searchWorker.run(data);
      return { success: 'true', info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });

  ipcMain.handle('db:deleteWorker', (event, data) => {
    const deleteUser = db.prepare(`DELETE FROM workers WHERE id = ?`);

    try {
      const info = deleteUser.run(data.workerId);
      return { success: 'true', info };
    } catch (err) {
      console.log(err);
      return { success: 'false', err };
    }
  });
}
