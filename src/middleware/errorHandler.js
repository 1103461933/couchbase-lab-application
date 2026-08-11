const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };