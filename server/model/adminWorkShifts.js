const { EntitySchema } = require('typeorm');

class AdminWorkShifts {
  constructor() {
    this.id = undefined;
    this.admin_id = undefined;
    this.shift_date = undefined;
    this.shift_start_time = undefined;
    this.shift_end_time = undefined;
    this.total_hours = undefined;
  }
}

const AdminWorkShiftsSchema = new EntitySchema({
  name: 'AdminWorkShifts',
  target: AdminWorkShifts,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    admin_id: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    phone: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    admin: {
      target: 'Admin',
      type: 'many-to-one',
      joinColumn: {
        name: 'admin_id',
      },
      onDelete: 'CASCADE', // If an admin is deleted, remove their shifts
    },
  },
});

module.exports = AdminWorkShiftsSchema;
