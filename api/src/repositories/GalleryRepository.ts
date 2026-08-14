import { prisma } from '@/lib/prisma';
import type { GalleryImage } from '@prisma/client';
import type { GalleryImageCreateInput, GalleryImageUpdateInput } from '@/types/gallery';

export class GalleryRepository {
  findAll(): Promise<GalleryImage[]> {
    return prisma.galleryImage.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<GalleryImage | null> {
    return prisma.galleryImage.findUnique({ where: { id } });
  }

  create(data: GalleryImageCreateInput): Promise<GalleryImage> {
    return prisma.galleryImage.create({ data });
  }

  update(id: string, data: GalleryImageUpdateInput): Promise<GalleryImage> {
    return prisma.galleryImage.update({ where: { id }, data });
  }

  delete(id: string): Promise<GalleryImage> {
    return prisma.galleryImage.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.galleryImage.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  }
}
