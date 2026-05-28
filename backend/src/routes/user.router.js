const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = Router();

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateMe);
router.delete('/me', authMiddleware, userController.deleteMe);

module.exports = router;
