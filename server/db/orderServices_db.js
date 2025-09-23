'use strict';

const OrderServices = require('../model/orderServicesModel');
const db = require('../config/db').getRepository(OrderServices);
class OrderServicesDB {
  static async createOrUpdateOrderService(obj) {
    const existing = await db.findOneBy({
      order_id: obj.order_id,
      service_id: obj.service_id,
    });
    if (existing) {
      return await db.update(
        { order_id: obj.order_id, service_id: obj.service_id },
        obj,
      );
    }
    return await db.save(obj);
  }

  static async getAll() {
    return await db.find();
  }

  static async getByOrderId(id) {
    return await db.find({ order_id: id });
  }
}

module.exports = OrderServicesDB;
