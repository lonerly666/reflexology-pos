const { EntitySchema } = require('typeorm');

class Orders {
  constructor() {
    this.id = undefined;
    this.member_id = undefined;
    this.total_amount = undefined;
    this.discount = undefined;
    this.final_amount = undefined;
    this.status = undefined;
    this.points_used = undefined;
    this.room = undefined;
    this.created_at = undefined;
  }
}

const OrderSchema = new EntitySchema({
  name: 'Orders',
  target: Orders,
  columns: {
    id: {
      primary: true,
      type: 'varchar',
    },
    member_id: {
      type: 'int',
    },
    total_amount: {
      type: 'decimal',
      scale: 2,
      nullable: false,
    },
    discount: {
      type: 'decimal',
      scale: 2,
      default: 0.0,
    },
    final_amount: {
      type: 'decimal',
      scale: 2,
      nullable: false,
    },
    points_used: {
      type: 'int',
      default: 0,
    },
    status: {
      type: 'varchar',
      default: 'pending',
    },
    room: {
      type: 'varchar',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    member: {
      target: 'Member',
      type: 'many-to-one',
      joinColumn: {
        name: 'member_id',
      },
    },
    orderServices: {
      target: 'OrderServices',
      type: 'one-to-many',
      inverseSide: 'order',
      joinColumn: {
        name: 'order_id',
      },
    },
    orderPayments: {
      target: 'OrderPayments',
      type: 'one-to-many',
      inverseSide: 'order',
      joinColumn: {
        name: 'order_id',
      },
    },
  },
});

module.exports = OrderSchema;
