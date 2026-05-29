const todoService = require('../services/todo.service');
const { validateMonth } = require('../validators/todo.validator');

async function getTodos(req, res, next) {
  try {
    const { categoryId, status, overdue, month } = req.query;
    if (month) validateMonth(month);
    const todos = await todoService.getTodos(req.userId, {
      categoryId,
      status,
      overdue: overdue === 'true',
      month,
    });
    res.status(200).json({ success: true, data: { todos } });
  } catch (err) {
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const todo = await todoService.createTodo(req.userId, req.body);
    res.status(201).json({ success: true, data: { todo } });
  } catch (err) {
    next(err);
  }
}

async function getTodo(req, res, next) {
  try {
    const todo = await todoService.getTodo(req.userId, req.params.id);
    res.status(200).json({ success: true, data: { todo } });
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const todo = await todoService.updateTodo(req.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data: { todo } });
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    await todoService.deleteTodo(req.userId, req.params.id);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos, createTodo, getTodo, updateTodo, deleteTodo };
