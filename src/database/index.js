const { Sequelize } = require('sequelize');
const config = require('../config');
const defineModels = require('../models/cart.model');

let sequelize = null;
let Cart = null;
let CartItem = null;

if (config.databaseUrl) {
  try {
    sequelize = new Sequelize(config.databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        config.nodeEnv === 'production'
          ? { ssl: { rejectUnauthorized: false } }
          : {},
    });

    const models = defineModels(sequelize);
    Cart = models.Cart;
    CartItem = models.CartItem;
  } catch (err) {
    console.warn(
      'Database connection failed, falling back to in-memory storage:',
      err.message,
    );
    sequelize = null;
  }
}

module.exports = { sequelize, Cart, CartItem };
