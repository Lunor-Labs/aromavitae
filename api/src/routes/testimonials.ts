import { Router } from 'express';
import { z } from 'zod';
import { TestimonialController } from '@/controllers/TestimonialController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { testimonialCreateSchema, testimonialUpdateSchema } from '@/types/testimonial';

export const testimonialsRouter = Router();
const controller = new TestimonialController();

const reorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) });

testimonialsRouter.get('/', controller.getAll);
testimonialsRouter.patch('/reorder', requireAdmin, validate(reorderSchema), controller.reorder);
testimonialsRouter.get('/:id', controller.getById);
testimonialsRouter.post('/', requireAdmin, validate(testimonialCreateSchema), controller.create);
testimonialsRouter.put('/:id', requireAdmin, validate(testimonialUpdateSchema), controller.update);
testimonialsRouter.delete('/:id', requireAdmin, controller.delete);
