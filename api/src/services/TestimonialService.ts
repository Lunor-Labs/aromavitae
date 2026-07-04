import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { TestimonialRepository } from '@/repositories/TestimonialRepository';
import type { Testimonial } from '@prisma/client';
import type { TestimonialCreateInput, TestimonialUpdateInput } from '@/types/testimonial';

export class TestimonialService {
  constructor(private repo = new TestimonialRepository()) {}

  async getAll(): Promise<Testimonial[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Testimonial> {
    const t = await this.repo.findById(id);
    if (!t) throw new AppError('Testimonial not found', 404, 'NOT_FOUND');
    return t;
  }

  async create(input: TestimonialCreateInput): Promise<Testimonial> {
    const t = await this.repo.create(input);
    logger.info({ id: t.id }, 'Testimonial created');
    await revalidateFrontend();
    return t;
  }

  async update(id: string, input: TestimonialUpdateInput): Promise<Testimonial> {
    await this.getById(id);
    const t = await this.repo.update(id, input);
    logger.info({ id: t.id }, 'Testimonial updated');
    await revalidateFrontend();
    return t;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Testimonial deleted');
    await revalidateFrontend();
  }
}
