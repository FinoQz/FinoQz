// routes/categoryRoutes.js
const express = require('express');
const { celebrate, Joi, errors } = require('celebrate');
const router = express.Router();
const c = require('../controllers/categoryController');

const createSchema = celebrate({
  body: Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(5).required()
  })
});

// Public routes
router.get('/', c.listCategories);
router.post('/', createSchema, c.createCategory);
router.delete('/:id', c.deleteCategory);

// Celebrate error handler
router.use(errors());

module.exports = router;
