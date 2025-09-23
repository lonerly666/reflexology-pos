'use strict';

const Orders = require('../model/ordersModel');
const db = require('../config/db').getRepository(Orders);
const { Between } = require('typeorm');
class OrderDB {
  static async createOrder(order) {
    return await db.save(order);
  }

  static async getAll() {
    return await db.find({
      relations: ['orderServices', 'orderPayments'],
    });
  }

  static async getOrderById(id) {
    return await db.findOne({
      where: { id: id },
      relations: ['orderServices', 'orderPayments'],
    });
  }

  static async getOrdersByDate(date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return await db.find({ created_at: Between(startDate, endDate) });
  }
}

module.exports = OrderDB;
