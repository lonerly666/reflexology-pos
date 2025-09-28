import { ipcMain } from 'electron';
import db from '../main/db';

export function servicesHandlers() {
  ipcMain.handle('db:getServices', () => {
    const stmt = db.prepare(`SELECT * FROM services ORDER BY name`);
    return stmt.all();
  });

  ipcMain.handle('db:addService', (event, service) => {
    const insert = db.prepare(
      `INSERT INTO services (name, category, price, duration) VALUES (@name, @category, @price, @duration)`,
    );
    try {
      const info = insert.run(service);
      return { success: 'true', ...info };
    } catch (err) {
      console.log('Failed to create service: ', err);
      return { success: 'false', err };
    }
  });
  ipcMain.handle('db:updateService', (event, service) => {
    const update = db.prepare(
      `UPDATE services SET name = @name, category = @category, price = @price, duration = @duration WHERE id = @id`,
    );
    try {
      const info = update.run(service);
      return { success: 'true', ...info };
    } catch (err) {
      console.log('Failed to update service: ', err);
      return { success: 'false', err };
    }
  });
  ipcMain.handle('db:deleteService', (event, id) => {
    const del = db.prepare(`DELETE FROM services WHERE id = ?`);
    try {
      const info = del.run(id);
      return { success: info.changes > 0 };
    } catch (err) {
      console.log('Failed to delete service: ', err);
      return { success: 'false', err };
    }
  });
}
