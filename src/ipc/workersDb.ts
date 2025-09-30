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
