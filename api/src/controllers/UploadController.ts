import type { NextFunction, Request, Response } from 'express';
import { UploadService } from '@/services/UploadService';

export class UploadController {
  constructor(private service = new UploadService()) {}

  createSignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await this.service.createSignedUpload(req.body) });
    } catch (e) {
      next(e);
    }
  };
}
