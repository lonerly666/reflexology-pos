const { EntitySchema } = require("typeorm");

class Admin {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.phone = undefined;
    this.email = undefined;
    this.password = undefined;
    this.created_at = undefined;
  }
}

const AdminSchema = new EntitySchema({
  name: "Admin",
  target: Admin,
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    phone: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations:{
    adminworkshifts: {
      target: "AdminWorkShifts",
      type: "one-to-many",
      inverseSide: "admin",
    },
  }
});

module.exports = AdminSchema;