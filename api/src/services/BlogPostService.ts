import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { sanitizeBlogContent } from '@/lib/sanitizeHtml';
import { BlogCategoryRepository } from '@/repositories/BlogCategoryRepository';
import { BlogPostRepository } from '@/repositories/BlogPostRepository';
import type { BlogPostCreateInput, BlogPostUpdateInput, BlogPostWithCategory } from '@/types/blog';

export class BlogPostService {
  constructor(
    private repo = new BlogPostRepository(),
    private categories = new BlogCategoryRepository()
  ) {}

  async getAll(): Promise<BlogPostWithCategory[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<BlogPostWithCategory> {
    const post = await this.repo.findById(id);
    if (!post) throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    return post;
  }

  async getBySlug(slug: string): Promise<BlogPostWithCategory> {
    const post = await this.repo.findBySlug(slug);
    if (!post) throw new AppError('Blog post not found', 404, 'NOT_FOUND');
    return post;
  }

  private async assertCategoryExists(categoryId: string | null | undefined): Promise<void> {
    if (!categoryId) return;
    const category = await this.categories.findById(categoryId);
    if (!category) throw new AppError('Blog category not found', 400, 'INVALID_CATEGORY');
  }

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.repo.findBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new AppError('That slug is already in use', 409, 'SLUG_TAKEN');
    }
  }

  async create(input: BlogPostCreateInput): Promise<BlogPostWithCategory> {
    await this.assertCategoryExists(input.categoryId);
    await this.assertSlugAvailable(input.slug);
    const post = await this.repo.create({ ...input, content: sanitizeBlogContent(input.content) });
    logger.info({ id: post.id }, 'Blog post created');
    await revalidateFrontend();
    return post;
  }

  async update(id: string, input: BlogPostUpdateInput): Promise<BlogPostWithCategory> {
    await this.getById(id);
    await this.assertCategoryExists(input.categoryId);
    if (input.slug) await this.assertSlugAvailable(input.slug, id);
    const data = input.content ? { ...input, content: sanitizeBlogContent(input.content) } : input;
    const post = await this.repo.update(id, data);
    logger.info({ id: post.id }, 'Blog post updated');
    await revalidateFrontend();
    return post;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Blog post deleted');
    await revalidateFrontend();
  }

  async reorder(ids: string[]): Promise<void> {
    await this.repo.reorder(ids);
    logger.info({ count: ids.length }, 'Blog posts reordered');
    await revalidateFrontend();
  }
}
