import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/config/env';
import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { s3 } from '@/lib/s3';
import type { UploadRequest } from '@/types/upload';

const SAFE_NAME = /[^a-zA-Z0-9.\-_]/g;
const UPLOAD_URL_TTL_SECONDS = 60 * 5;

export class UploadService {
  async createSignedUpload(input: UploadRequest): Promise<{ uploadUrl: string; path: string; publicUrl: string }> {
    const safeName = input.filename.replace(SAFE_NAME, '_');
    const path = `${new Date().getFullYear()}/${randomUUID()}-${safeName}`;

    try {
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: path,
          ContentType: input.contentType,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS }
      );

      return {
        uploadUrl,
        path,
        publicUrl: `${env.S3_PUBLIC_URL}/${path}`,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to create signed upload URL');
      throw new AppError('Could not create upload URL', 500, 'STORAGE_ERROR');
    }
  }
}
