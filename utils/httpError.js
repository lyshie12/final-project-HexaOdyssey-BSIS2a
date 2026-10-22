// Create an error that carries an HTTP status code.
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = httpError;
