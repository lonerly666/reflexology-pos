'use strict';

const Member = require('../model/memberModel');
const db = require('../config/db').getRepository(Member);
class MemberDB {
  static async createMember(id, member) {
    const existing = await db.findOneBy({ id: id });
    if (existing) {
      return await db.update(
        { id: id },
        {
          ...member,
        },
      );
    }
    return await db.save(member);
  }

  static async getAll() {
    return await db.find();
  }

  static async getMemberById(id) {
    return await db.findOneBy({ id: id });
  }

  static async getMemberByEmail(email) {
    return await db.findOneBy({ email: email });
  }

  static async getMemberByName(name) {
    return await db.findOneBy({ name: name });
  }

  static async getMemberByPhone(phone) {
    return await db.findOneBy({ phone: phone });
  }
}

module.exports = MemberDB;
