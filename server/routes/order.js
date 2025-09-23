const router = require('express').Router();
const OrderDB = require('../db/orders_db');
const Order = require('../model/ordersModel');
const OrderRepo = require('../config/db').getRepository(Order);
const OrderServiceDB = require('../db/orderServices_db');
const OrderService = require('../model/orderServicesModel');
const OrderServiceRepo = require('../config/db').getRepository(OrderService);
const OrderPaymentsDB = require('../db/orderPayments_db');
const OrderPayments = require('../model/orderPaymentsModel');
const OrderPaymentsRepo = require('../config/db').getRepository(OrderPayments);

router.get('/', async (req, res) => {
  try {
    const orders = await OrderDB.getAll();
    res.json(orders);
  } catch (err) {
    res.json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    //Create or Update new Order
    const order = OrderRepo.create({
      id: req.body.id,
      member_id: req.body.member_id,
      total_amount: req.body.total_amount,
      discount: req.body.discount,
      final_amount: req.body.final_amount,
      points_used: req.body.points_used,
      status: req.body.status,
    });
    const newOrder = await OrderDB.createOrder(order);

    //Create Order Services with Quantity
    const services = req.body.services;
    for (const [key, value] of Object.entries(services)) {
      const orderService = OrderServiceRepo.create({
        order_id: order.id,
        service_id: key,
        quantity: value,
      });
      await OrderServiceDB.createOrUpdateOrderService(orderService);
    }

    //Create Payment Methods Entries When Order Fully Paid
    if (order.status == 'paid') {
      const paymentMethods = req.body.payments;
      for (const [key, value] of Object.entries(paymentMethods)) {
        const orderPayments = OrderPaymentsRepo.create({
          order_id: order.id,
          amount: value,
          method: key,
        });
        await OrderPaymentsDB.createOrUpdateOrderPayments(orderPayments);
      }
    }

    res.json(newOrder);
  } catch (err) {
    res.json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await OrderDB.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    res.json(err);
  }
});

router.get('/date/:date', async (req, res) => {
  try {
    const orders = await OrderDB.getOrdersByDate(req.params.date);
    res.json(orders);
  } catch (err) {
    res.json(err);
  }
});

router.get('/member/:id', async (req, res) => {
  try {
    const orders = await OrderDB.getOrdersByMember(req.params.id);
    res.json(orders);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
