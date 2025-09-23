const router = require('express').Router();
const AdminDB = require('../db/admin_db');
const AdminShiftDB = require('../db/adminShifts_db');
const Admin = require('../model/adminModel');
const AdminRepo = require('../config/db').getRepository(Admin);


router.get('/', async (req, res) => {
  try{
    const admins = await AdminDB.getAll();
    res.json(admins);
  }
  catch(err){
    res.json(err);
  }
});

// Update an admin information
router.post('/', async (req, res) => {
  try{
    const admin = AdminRepo.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    await AdminDB.createAdmin(admin);
    res.json(admin);
  }
  catch(err){
    res.json(err);
  }
});

router.get('/shifts', async (req, res) => {
  try{
    const shifts = await AdminShiftDB.getAll();
    res.json(shifts);
  }
  catch(err){
    res.json(err);
  }
});


module.exports = router;