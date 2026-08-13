import { Router } from 'express';
import { z } from 'zod';
import { BlogPostController } from '@/controllers/BlogPostController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { blogPostCreateSchema, blogPostUpdateSchema } from '@/types/blog';

export const blogRouter = Router();
const controller = new BlogPostController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

blogRouter.get('/', controller.getAll);
blogRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
blogRouter.get('/slug/:slug', controller.getBySlug);
blogRouter.get('/:id', controller.getById);
blogRouter.post('/', requireAdmin, validate(blogPostCreateSchema), controller.create);
blogRouter.put('/:id', requireAdmin, validate(blogPostUpdateSchema), controller.update);
blogRouter.delete('/:id', requireAdmin, controller.delete);
