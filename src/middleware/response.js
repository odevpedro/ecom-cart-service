const { v4: uuid } = require('uuid');

function requestId(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuid();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

module.exports = requestId;
