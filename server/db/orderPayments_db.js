'use strict';

const OrderPayments = require('../model/orderPaymentsModel');
const db = require('../config/db').getRepository(OrderPayments);
class OrderPaymentsDB {
  static async createOrUpdateOrderPayments(obj) {
    return await db.save(obj);
  }

  static async getAll() {
    return await db.find();
  }

  static async getByOrderId(id) {
    return await db.find({ order_id: id });
  }
}

module.exports = OrderPaymentsDB;
