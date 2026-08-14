import { Router } from 'express';
import { z } from 'zod';
import { GalleryController } from '@/controllers/GalleryController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { galleryImageCreateSchema, galleryImageUpdateSchema } from '@/types/gallery';

export const galleryRouter = Router();
const controller = new GalleryController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

galleryRouter.get('/', controller.getAll);
galleryRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
galleryRouter.get('/:id', controller.getById);
galleryRouter.post('/', requireAdmin, validate(galleryImageCreateSchema), controller.create);
galleryRouter.put('/:id', requireAdmin, validate(galleryImageUpdateSchema), controller.update);
galleryRouter.delete('/:id', requireAdmin, controller.delete);
