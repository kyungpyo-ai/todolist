const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');

const router = Router();

router.get('/', authMiddleware, categoryController.getCategories);
router.post('/', authMiddleware, categoryController.createCategory);
router.patch('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
