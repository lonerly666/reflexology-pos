const { EntitySchema } = require('typeorm');

class Worker {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.phone = undefined;
    this.hired_date = undefined;
    this.end_date = undefined;
    this.is_active = undefined;
    this.created_at = undefined;
  }
}

const WorkerSchema = new EntitySchema({
  name: 'Worker',
  target: Worker,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      nullable: false,
    },
    phone: {
      type: 'varchar',
      unique: true,
      nullable: true,
    },
    hired_date: {
      type: 'varchar',
      nullable: false,
    },
    end_date: {
      type: 'varchar',
      nullable: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});

module.exports = WorkerSchema;
