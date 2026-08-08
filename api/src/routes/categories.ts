import { Router } from 'express';
import { z } from 'zod';
import { CategoryController } from '@/controllers/CategoryController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { categoryCreateSchema, categoryUpdateSchema } from '@/types/category';

export const categoriesRouter = Router();
const controller = new CategoryController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

categoriesRouter.get('/', controller.getAll);
categoriesRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
categoriesRouter.get('/:id', controller.getById);
categoriesRouter.post('/', requireAdmin, validate(categoryCreateSchema), controller.create);
categoriesRouter.put('/:id', requireAdmin, validate(categoryUpdateSchema), controller.update);
categoriesRouter.delete('/:id', requireAdmin, controller.delete);
