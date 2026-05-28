const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const todoController = require('../controllers/todo.controller');

const router = Router();

router.get('/', authMiddleware, todoController.getTodos);
router.post('/', authMiddleware, todoController.createTodo);
router.get('/:id', authMiddleware, todoController.getTodo);
router.patch('/:id', authMiddleware, todoController.updateTodo);
router.delete('/:id', authMiddleware, todoController.deleteTodo);

module.exports = router;
