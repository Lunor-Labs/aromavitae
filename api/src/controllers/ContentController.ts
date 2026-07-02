import type { NextFunction, Request, Response } from 'express';
import { ContentService } from '@/services/ContentService';

export class ContentController {
  constructor(private service = new ContentService()) {}

  getAggregate = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json({ data: await this.service.getAggregate() }); } catch (e) { next(e); }
  };
}
