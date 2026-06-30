import { Router } from 'express';
import { ContentController } from '@/controllers/ContentController';

export const contentRouter = Router();
const controller = new ContentController();

contentRouter.get('/', controller.getAggregate);
