import { Router } from 'express';
import { ProductController } from '@/controllers/ProductController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { productCreateSchema, productUpdateSchema } from '@/types/product';

export const productsRouter = Router();
const controller = new ProductController();

productsRouter.get('/', controller.getAll);
productsRouter.get('/:id', controller.getById);
productsRouter.post('/', requireAdmin, validate(productCreateSchema), controller.create);
productsRouter.put('/:id', requireAdmin, validate(productUpdateSchema), controller.update);
productsRouter.delete('/:id', requireAdmin, controller.delete);
