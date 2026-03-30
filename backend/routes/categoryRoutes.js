import express from 'express';
import { celebrate, Joi, errors } from 'celebrate';
import * as c from '../controllers/categoryController.js';

const router = express.Router();

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

export default router;
