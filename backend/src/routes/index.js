const { Router } = require('express');
const authRouter = require('./auth.router');
const userRouter = require('./user.router');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);

module.exports = router;
