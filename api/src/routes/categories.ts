import { Router } from 'express';
import { CategoryController } from '@/controllers/CategoryController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { categoryCreateSchema, categoryUpdateSchema } from '@/types/category';

export const categoriesRouter = Router();
const controller = new CategoryController();

categoriesRouter.get('/', controller.getAll);
categoriesRouter.get('/:id', controller.getById);
categoriesRouter.post('/', requireAdmin, validate(categoryCreateSchema), controller.create);
categoriesRouter.put('/:id', requireAdmin, validate(categoryUpdateSchema), controller.update);
categoriesRouter.delete('/:id', requireAdmin, controller.delete);
