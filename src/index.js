const { runMigrations } = require('./database/migrate');
const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

async function start() {
  await runMigrations();

  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Cart Service started');
  });
}

start();
