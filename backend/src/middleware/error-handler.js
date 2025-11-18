/* eslint no-unused-vars: "off" */

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const payload = { message };

  if (err.details) {
    payload.details = err.details;
  }

  if (req.app.get('env') !== 'test' && status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;
