const crypto = require('crypto');

const ERROR_CODES = {
  'Product not found': 'PRODUCT_NOT_FOUND',
  'User not found': 'USER_NOT_FOUND',
  'Cart not found': 'CART_NOT_FOUND',
  'Invalid request body': 'INVALID_REQUEST',
};

function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || crypto.randomUUID();
  const message = err.message || 'Internal server error';
  const code = ERROR_CODES[message] || 'INTERNAL_ERROR';
  const status = err.status || (message.includes('not found') ? 404 : 400);

  res.status(status).json({
    data: null,
    error: { code, message, details: err.details || {} },
    meta: { requestId },
  });
}

module.exports = errorHandler;
