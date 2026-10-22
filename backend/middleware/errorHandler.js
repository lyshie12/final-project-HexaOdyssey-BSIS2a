const httpError = require('../utils/httpError');

// Runs when no route matched.
const notFound = (req, res, next) => {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Turns any error into a JSON response.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {}).join(', ')} already exists`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }

  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Server error';
  }

  const body = { message };
  if (process.env.NODE_ENV === 'development') body.stack = err.stack;
  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
