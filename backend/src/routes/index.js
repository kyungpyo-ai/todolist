const { Router } = require('express');
const authRouter = require('./auth.router');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

router.use('/auth', authRouter);

module.exports = router;
