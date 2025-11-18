const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${host}:${port}`);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind =
    typeof port === 'string'
      ? `Pipe ${port}`
      : `http://${host}:${port}`;
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
