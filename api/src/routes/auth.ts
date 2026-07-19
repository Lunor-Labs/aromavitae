import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '@/controllers/AuthController';
import { requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { loginSchema } from '@/types/auth';

export const authRouter = Router();
const controller = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/login', loginLimiter, validate(loginSchema), controller.login);
authRouter.get('/me', requireAdmin, controller.me);
