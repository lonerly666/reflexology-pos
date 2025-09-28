import { ipcMain } from 'electron';
import db from '../main/db';

export function membersHandler() {
  ipcMain.handle('db:addMember', (event, data) => {
    const insert = db.prepare(
      `INSERT INTO members (name, phone, email, totalSpent, points, joinDate, lastVisit) VALUES (@name, @phone, @email, @totalSpent, @points, @joinDate, @lastVisit)`,
    );
    const info = insert.run(data);
    return { ...data, info: info };
  });

  ipcMain.handle('db:getMembers', (event, data) => {
    const stmt = db.prepare(`SELECT * FROM members ORDER by lastVisit DESC`);
    return stmt.all();
  });

  ipcMain.handle('db:searchMember', (event, params) => {
    const query = params;
    const searchTerm = `%${query}%`;
    const stmt = db.prepare(
      `SELECT * FROM members 
   WHERE name LIKE ? OR phone LIKE ? 
   ORDER BY lastVisit DESC`,
    );
    try {
      const info = stmt.all(searchTerm,searchTerm);
      console.log(info);
      return { success: true, info };
    } catch (err) {
      console.log('Failed to search member: ', err);
      return { success: false, err };
    }
  });

  ipcMain.handle('db:updateMember', (event, data) => {
    if (data.update === 'topup') {
      const update = db.prepare(
        `UPDATE members SET points = @points WHERE id = @id`,
      );
      try {
        const info = update.run(data);
        return { success: true, info };
      } catch (error) {
        console.error('Failed to update member:', error);
        return { success: false, error };
      }
    } else {
      const update = db.prepare(
        `UPDATE members SET name = @name, phone = @phone, email = @email, lastVisit = @lastVisit, totalSpent=@totalSpent`,
      );
      try {
        const info = update.run(data);
        return { success: true, info };
      } catch (error) {
        console.error('Failed to update member:', error);
        return { success: false, error };
      }
    }
  });

  ipcMain.handle('db:deleteMember', (event, data) => {
    const id = data;
    const del = db.prepare(`DELETE FROM members WHERE id = ${id}`);
    try {
      const info = del.run();
      return { success: info.changes > 0, info };
    } catch (err) {
      console.log('Failed to delete member:', err);
    }
  });
}
