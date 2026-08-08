import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { GalleryRepository } from '@/repositories/GalleryRepository';
import type { GalleryImage } from '@prisma/client';
import type { GalleryImageCreateInput, GalleryImageUpdateInput } from '@/types/gallery';

export class GalleryService {
  constructor(private repo = new GalleryRepository()) {}

  async getAll(): Promise<GalleryImage[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<GalleryImage> {
    const image = await this.repo.findById(id);
    if (!image) throw new AppError('Gallery image not found', 404, 'NOT_FOUND');
    return image;
  }

  async create(input: GalleryImageCreateInput): Promise<GalleryImage> {
    const image = await this.repo.create(input);
    logger.info({ id: image.id }, 'Gallery image created');
    await revalidateFrontend();
    return image;
  }

  async update(id: string, input: GalleryImageUpdateInput): Promise<GalleryImage> {
    await this.getById(id);
    const image = await this.repo.update(id, input);
    logger.info({ id: image.id }, 'Gallery image updated');
    await revalidateFrontend();
    return image;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Gallery image deleted');
    await revalidateFrontend();
  }

  async reorder(ids: string[]): Promise<void> {
    await this.repo.reorder(ids);
    logger.info({ count: ids.length }, 'Gallery images reordered');
    await revalidateFrontend();
  }
}
