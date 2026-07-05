import { Router } from 'express';
import { z } from 'zod';
import { OutletController } from '@/controllers/OutletController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { outletCreateSchema, outletUpdateSchema } from '@/types/outlet';

export const outletsRouter = Router();
const controller = new OutletController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

outletsRouter.get('/', controller.getAll);
outletsRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
outletsRouter.get('/:id', controller.getById);
outletsRouter.post('/', requireAdmin, validate(outletCreateSchema), controller.create);
outletsRouter.put('/:id', requireAdmin, validate(outletUpdateSchema), controller.update);
outletsRouter.delete('/:id', requireAdmin, controller.delete);
