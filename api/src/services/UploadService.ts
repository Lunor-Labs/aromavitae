import { randomUUID } from 'node:crypto';
import { env } from '@/config/env';
import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import type { UploadRequest } from '@/types/upload';

const SAFE_NAME = /[^a-zA-Z0-9.\-_]/g;

export class UploadService {
  async createSignedUpload(input: UploadRequest): Promise<{ uploadUrl: string; token: string; path: string; publicUrl: string }> {
    const safeName = input.filename.replace(SAFE_NAME, '_');
    const path = `${new Date().getFullYear()}/${randomUUID()}-${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      logger.error({ error }, 'Failed to create signed upload URL');
      throw new AppError('Could not create upload URL', 500, 'STORAGE_ERROR');
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(path);

    return {
      uploadUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: publicData.publicUrl,
    };
  }
}
