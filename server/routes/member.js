const router = require('express').Router();
const MemberDB = require('../db/members_db');
const Member = require('../model/memberModel');
const MemberRepo = require('../config/db').getRepository(Member);

router.get('/', async (req, res) => {
  try {
    const members = await MemberDB.getAll();
    res.json(members);
  } catch (err) {
    res.json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const member = MemberRepo.create({
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      points_balance: req.body.points_balance,
    });
    const newMember = await MemberDB.createMember(req.body.id, member);
    res.json(newMember);
  } catch (err) {
    res.json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await MemberDB.getMemberById(req.params.id);
    res.json(member);
  } catch (err) {
    res.json(err);
  }
});

router.get('/email/:email', async (req, res) => {
  try {
    const member = await MemberDB.getMemberByEmail(req.params.email);
    res.json(member);
  } catch (err) {
    res.json(err);
  }
});

router.get('/name/:name', async (req, res) => {
  try {
    const member = await MemberDB.getMemberByName(req.params.name);
    res.json(member);
  } catch (err) {
    res.json(err);
  }
});

router.get('/phone/:phone', async (req, res) => {
  try {
    const member = await MemberDB.getMemberByPhone(req.params.phone);
    res.json(member);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
