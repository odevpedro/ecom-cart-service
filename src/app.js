const express = require('express');
const cartRoutes = require('./routes/cart.routes');

const app = express();

app.use(express.json());
app.use('/api/cart', cartRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
