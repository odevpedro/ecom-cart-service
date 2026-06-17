const { Sequelize } = require('sequelize');
const config = require('../config');
const defineModels = require('../models/cart.model');
const logger = require('../config/logger');

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
    logger.warn({ error: err.message }, 'Database connection failed, falling back to in-memory storage');
    sequelize = null;
  }
}

module.exports = { sequelize, Cart, CartItem };
