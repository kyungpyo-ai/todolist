const express = require('express');
const cors = require('cors');
const router = require('../routes/index');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));

app.use(express.json());

app.use('/api', router);

module.exports = app;
