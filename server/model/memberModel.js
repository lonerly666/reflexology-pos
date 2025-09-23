const { EntitySchema } = require('typeorm');

class Member {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.phone = undefined;
    this.email = undefined;
    this.points_balance = undefined;
    this.created_at = undefined;
  }
}

const MemberSchema = new EntitySchema({
  name: 'Member',
  target: Member,
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
    email: {
      type: 'varchar',
      unique: true,
    },
    phone: {
      type: 'varchar',
      unique: true,
    },
    points_balance: {
      type: 'int',
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    orders: {
      target: 'Orders',
      type: 'one-to-many',
      inverseSide: 'member',
    },
  },
});

module.exports = MemberSchema;
