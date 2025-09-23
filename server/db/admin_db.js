"use strict"


const Admin = require('../model/adminModel');
const db  = require('../config/db').getRepository(Admin);
class AdminDB{

    static async createAdmin(user){
        return await db.save(user)
    }

    static async getAll(){
        return await db.find()
    }

    static async getAdminById(id){
        return await db.findOneBy({id:id});
    }

    
    static async getAdminByEmail(email){
        return await db.findOneBy({email:email});
    }

    static async updateAdmin(user){
        return await db.save(user);
    }

}


module.exports = AdminDB;