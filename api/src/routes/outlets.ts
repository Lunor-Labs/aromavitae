import { Router } from 'express';
import { OutletController } from '@/controllers/OutletController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { outletCreateSchema, outletUpdateSchema } from '@/types/outlet';

export const outletsRouter = Router();
const controller = new OutletController();

outletsRouter.get('/', controller.getAll);
outletsRouter.get('/:id', controller.getById);
outletsRouter.post('/', requireAdmin, validate(outletCreateSchema), controller.create);
outletsRouter.put('/:id', requireAdmin, validate(outletUpdateSchema), controller.update);
outletsRouter.delete('/:id', requireAdmin, controller.delete);
