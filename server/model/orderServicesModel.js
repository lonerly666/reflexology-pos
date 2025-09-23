const { EntitySchema } = require('typeorm');

class OrderServices {
  constructor() {
    this.id = undefined;
    this.order_id = undefined;
    this.service_id = undefined;
    this.quantity = undefined;
  }
}

const OrderServicesSchema = new EntitySchema({
  name: 'OrderServices',
  target: OrderServices,
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
    quantity: {
      type: 'int',
      default: 1,
    },
    service_id: {
      type: 'int',
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
    },
    service: {
      target: 'Services',
      type: 'many-to-one',
      joinColumn: {
        name: 'service_id',
      },
    },
  },
});

module.exports = OrderServicesSchema;
