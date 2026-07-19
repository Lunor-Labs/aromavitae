import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';

export class AuthController {
  constructor(private service = new AuthService()) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.service.login(req.body) });
    } catch (e) {
      next(e);
    }
  };

  me = (req: Request, res: Response) => {
    res.json({ data: req.adminUser });
  };
}
