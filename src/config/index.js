require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3002,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  productCatalogUrl: process.env.PRODUCT_CATALOG_URL || 'http://localhost:3001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3007',
  nodeEnv: process.env.NODE_ENV || 'development',
};
