const express = require('express');
const swaggerUi = require('swagger-ui-express');
const pinoHttp = require('pino-http');
const requestId = require('./middleware/response');
const errorHandler = require('./middleware/error-handler');
const cartRoutes = require('./routes/cart.routes');
const swaggerSpec = require('./config/swagger');
const db = require('./database');
const logger = require('./config/logger');

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(requestId);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'cart' }));
app.get('/live', (_req, res) => res.json({ status: 'alive' }));
app.get('/ready', (_req, res) => res.json({ status: 'ready' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/cart', cartRoutes);
app.use(errorHandler);

if (db.sequelize) {
  db.sequelize
    .sync()
    .then(() => logger.info('Database synced'))
    .catch((err) => logger.warn({ error: err.message }, 'Database sync failed'));
}

module.exports = app;
