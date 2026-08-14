import { Router } from 'express';
import { z } from 'zod';
import { BlogCategoryController } from '@/controllers/BlogCategoryController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { blogCategoryCreateSchema, blogCategoryUpdateSchema } from '@/types/blogCategory';

export const blogCategoriesRouter = Router();
const controller = new BlogCategoryController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

blogCategoriesRouter.get('/', controller.getAll);
blogCategoriesRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
blogCategoriesRouter.get('/:id', controller.getById);
blogCategoriesRouter.post('/', requireAdmin, validate(blogCategoryCreateSchema), controller.create);
blogCategoriesRouter.put('/:id', requireAdmin, validate(blogCategoryUpdateSchema), controller.update);
blogCategoriesRouter.delete('/:id', requireAdmin, controller.delete);
