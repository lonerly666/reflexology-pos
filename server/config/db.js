const mysql = require('mysql2');
require('reflect-metadata');
const { DataSource } = require('typeorm');
const adminModel = require('../model/adminModel');
const orderModel = require('../model/ordersModel');
const serviceModel = require('../model/servicesModel');
const memberModel = require('../model/memberModel');
const adminShiftModel = require('../model/adminWorkShifts');
const orderServicesModel = require('../model/orderServicesModel');
const orderPaymentsModel = require('../model/orderPaymentsModel');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'sales_manager',
  synchronize: true,
  entities: [
    adminModel,
    orderModel,
    serviceModel,
    memberModel,
    adminShiftModel,
    orderServicesModel,
    orderPaymentsModel,
  ],
  logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = AppDataSource;
