const { EntitySchema } = require('typeorm');

class Services {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.description = undefined;
    this.price = undefined;
    this.duration = undefined;
  }
}

const ServiceSchema = new EntitySchema({
  name: 'Services',
  target: Services,
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
    description: {
      type: 'varchar',
      nullable: true,
      default:"",
    },
    price: {
      type: 'decimal',
      scale: 2,
      nullable: false,
      default: 0.0,
    },
    duration: {
      type: 'int',
      nullable: false,
    },
  },
});

module.exports = ServiceSchema;
