const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const todosRouter = require('./routes/todos.routes');
const swaggerSpec = require('./openapi/swagger');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.json({
    message: 'TODO API is running. See /docs for the OpenAPI UI.',
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/todos', todosRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
