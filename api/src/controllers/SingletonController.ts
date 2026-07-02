import type { NextFunction, Request, Response } from 'express';
import { SingletonService } from '@/services/SingletonService';

export class SingletonController {
  constructor(private service = new SingletonService()) {}

  getByKey = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.getByKey(req.params.key) }); } catch (e) { next(e); }
  };

  upsert = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.upsert(req.params.key, req.body) }); } catch (e) { next(e); }
  };
}
