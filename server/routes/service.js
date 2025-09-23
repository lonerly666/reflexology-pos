const router = require('express').Router();
const ServiceDB = require('../db/services_db');
const Service = require('../model/servicesModel');
const ServiceRepo = require('../config/db').getRepository(Service);

router.get('/', async (req, res) => {
  try {
    const services = await ServiceDB.getAll();
    res.json(services);
  } catch (err) {
    res.json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const service = ServiceRepo.create({
      id: req.body.id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      duration: req.body.duration,
    });
    await ServiceDB.createService(service);
    res.json(service);
  } catch (err) {
    res.json(err);
  }
});
module.exports = router;