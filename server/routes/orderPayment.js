const router = require('express').Router();
const OrderPayments = require('../db/orderPayments_db');
const OrderPayment = require('../model/orderPaymentsModel');
const OrderPaymentRepo = require('../config/db').getRepository(OrderPayment);

router.get('/', async (req, res) => {
  try {
    const orderPayments = await OrderPayments.getAll();
    res.json(orderPayments);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
