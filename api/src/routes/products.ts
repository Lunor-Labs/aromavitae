import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from '@/controllers/ProductController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { productCreateSchema, productUpdateSchema } from '@/types/product';

export const productsRouter = Router();
const controller = new ProductController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

productsRouter.get('/', controller.getAll);
productsRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
productsRouter.get('/:id', controller.getById);
productsRouter.post('/', requireAdmin, validate(productCreateSchema), controller.create);
productsRouter.put('/:id', requireAdmin, validate(productUpdateSchema), controller.update);
productsRouter.delete('/:id', requireAdmin, controller.delete);
