"use strict"


const AdminShifts = require('../model/adminWorkShifts');
const db  = require('../config/db').getRepository(AdminShifts);
class AdminShiftsDB{

    static async createShift(adminWorkShifts){
        return await db.save(adminWorkShifts)
    }

    static async getAll(){
        return await db.find()
    }

    static async getShiftsByAdminId(id){
        return await db.findBy({admin_id:id});
    }

    static async getShiftsByDate(date){
        const startDate = new Date(date);
        const endDate = new Date(date);
        startDate.setHours(0,0,0,0);
        endDate.setHours(23,59,59,999);
        return await db.find({date: Between(startDate, endDate)});
    }

}


module.exports = AdminShiftsDB;