const router = require('express').Router();
const OrderServiceDB = require('../db/orderServices_db');
const OrderService = require('../model/orderServicesModel');
const OrderServiceRepo = require('../config/db').getRepository(OrderService);

router.get('/', async (req, res) => {
  try {
    const orderServices = await OrderServiceDB.getAll();
    res.json(orderServices);
  } catch (err) {
    res.json(err);
  }
});



module.exports = router;