import { prisma } from '@/lib/prisma';
import type { Testimonial } from '@prisma/client';
import type { TestimonialCreateInput, TestimonialUpdateInput } from '@/types/testimonial';

export class TestimonialRepository {
  findAll(): Promise<Testimonial[]> {
    return prisma.testimonial.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<Testimonial | null> {
    return prisma.testimonial.findUnique({ where: { id } });
  }

  create(data: TestimonialCreateInput): Promise<Testimonial> {
    return prisma.testimonial.create({ data });
  }

  update(id: string, data: TestimonialUpdateInput): Promise<Testimonial> {
    return prisma.testimonial.update({ where: { id }, data });
  }

  delete(id: string): Promise<Testimonial> {
    return prisma.testimonial.delete({ where: { id } });
  }
}
