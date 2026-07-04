import { Router } from 'express';
import { TestimonialController } from '@/controllers/TestimonialController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { testimonialCreateSchema, testimonialUpdateSchema } from '@/types/testimonial';

export const testimonialsRouter = Router();
const controller = new TestimonialController();

testimonialsRouter.get('/', controller.getAll);
testimonialsRouter.get('/:id', controller.getById);
testimonialsRouter.post('/', requireAdmin, validate(testimonialCreateSchema), controller.create);
testimonialsRouter.put('/:id', requireAdmin, validate(testimonialUpdateSchema), controller.update);
testimonialsRouter.delete('/:id', requireAdmin, controller.delete);
