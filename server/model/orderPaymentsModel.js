const { EntitySchema } = require('typeorm');

class OrderPayments {
  constructor() {
    this.id = undefined;
    this.order_id = undefined;
    this.method = undefined;
    this.amount = undefined;
  }
}

const OrderPaymentSchema = new EntitySchema({
  name: 'OrderPayments',
  target: OrderPayments,
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    order_id: {
      type: 'varchar',
      nullable: false,
    },
    method: {
      type: 'varchar',
      nullable: false,
    },
    amount: {
      type: 'decimal',
      scale: 2,
      nullable: false,
    },
  },
  relations: {
    order: {
      target: 'Orders',
      type: 'many-to-one',
      joinColumn: {
        name: 'order_id',
      },
      onDelete: 'CASCADE',
    },
  },
});

module.exports = OrderPaymentSchema;
