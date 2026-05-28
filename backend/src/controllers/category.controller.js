const categoryService = require('../services/category.service');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.userId);
    res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.userId, req.body);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.userId, req.params.id);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
