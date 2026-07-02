import type { NextFunction, Request, Response } from 'express';
import { TestimonialService } from '@/services/TestimonialService';

export class TestimonialController {
  constructor(private service = new TestimonialService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.getAll() }); } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.getById(req.params.id) }); } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json({ data: await this.service.create(req.body) }); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.update(req.params.id, req.body) }); } catch (e) { next(e); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.service.delete(req.params.id); res.status(204).send(); } catch (e) { next(e); }
  };
}
