import { Router } from 'express';
import { SingletonController } from '@/controllers/SingletonController';
import { requireAdmin } from '@/middleware/auth';

export const singletonsRouter = Router();
const controller = new SingletonController();

singletonsRouter.get('/:key', controller.getByKey);
singletonsRouter.put('/:key', requireAdmin, controller.upsert);
