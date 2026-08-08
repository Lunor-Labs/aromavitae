import type { NextFunction, Request, Response } from 'express';
import { GalleryService } from '@/services/GalleryService';

export class GalleryController {
  constructor(private service = new GalleryService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAll();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getById(req.params.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.update(req.params.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.reorder((req.body as { ids: string[] }).ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
