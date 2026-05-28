const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');
const router = require('../routes/index');
const loggerMiddleware = require('../middleware/logger.middleware');
const { errorMiddleware } = require('../middleware/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));

app.use(express.json());

app.use(loggerMiddleware);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', router);

app.use(errorMiddleware);

module.exports = app;
