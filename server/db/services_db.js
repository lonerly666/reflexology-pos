"use strict"


const Services = require('../model/servicesModel');
const db  = require('../config/db').getRepository(Services);
class ServicesDB{

    static async createService(service){
        return await db.save(service)
    }

    static async getAll(){
        return await db.find()
    }

    static async getServiceById(id){
        return await db.findOneBy({id:id});
    }

    static async updateService(service){
        return await db.save(service);
    }

}


module.exports = ServicesDB;