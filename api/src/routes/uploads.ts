import { Router } from 'express';
import { UploadController } from '@/controllers/UploadController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { uploadRequestSchema } from '@/types/upload';

export const uploadsRouter = Router();
const controller = new UploadController();

uploadsRouter.post('/signed-url', requireAdmin, validate(uploadRequestSchema), controller.createSignedUrl);
